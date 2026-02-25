"use server";

import { createLogger } from "@/lib/logger";
import { ProductServiceApi } from "@/services/api/product/product-service-api";
import type {
  FindProductsRequest,
  ProductListItem,
} from "@/services/api/product/types/product-types";
import type { Product } from "@/types/types";
import { getValidImageUrl } from "@/utils/image-utils";
import { generateSlugFromName } from "@/utils/slug-utils";

const logger = createLogger("ProductActions");

/**
 * Helper function to safely parse float from string values
 */
function safeParseFloat(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Calculate promotional price based on PROMOCAO flag
 * In this implementation, we assume a 10% discount when promotion is active
 * This logic can be adjusted based on business rules
 */
function calculatePromotionalPrice(
  normalPrice: number,
  isPromotion: boolean,
): number | undefined {
  if (!isPromotion || normalPrice <= 0) return undefined;
  // Apply 10% discount for promotional price
  return normalPrice * 0.9;
}

/**
 * Transform API ProductListItem to application Product interface
 * Based on the API Reference documentation and prompt requirements
 */
function transformApiProductToProduct(
  apiProduct: ProductListItem,
  index?: number,
): Product {
  try {
    // Validate required fields
    if (!apiProduct || typeof apiProduct !== "object") {
      throw new Error("Invalid API product data");
    }

    // ID - Use API ID or generate fallback
    const productId = apiProduct.ID_PRODUTO;
    const id =
      productId?.toString() || `temp-${Date.now()}-${index || Math.random()}`;

    // Name - Use API product name
    const name = apiProduct.PRODUTO || "Produto sem nome";

    // SKU - Use real SKU from API, convert to string
    const sku = apiProduct.SKU?.toString() || "0";

    // Image - Use validated image URL with fallback
    const image = getValidImageUrl(apiProduct.PATH_IMAGEM);

    // Prices - Convert string prices to numbers
    const normalPrice = safeParseFloat(apiProduct.VL_VAREJO);
    const wholesalePrice = safeParseFloat(apiProduct.VL_ATACADO);
    const corporatePrice = safeParseFloat(apiProduct.VL_CORPORATIVO);

    // Stock - Use API stock value
    const stock = apiProduct.ESTOQUE_LOJA || 0;

    // Category - Use TIPO (product type) instead of brand
    const category = apiProduct.TIPO || "Sem Categoria";
    const type = apiProduct.TIPO || undefined;

    // Brand - Use MARCA_NOME (required field)
    const brand = apiProduct.MARCA_NOME || "Sem Marca";

    // Warranty - Use TEMPODEGARANTIA_DIA
    const warrantyDays = apiProduct.TEMPODEGARANTIA_DIA || 0;

    // Flags - Convert numeric flags to boolean
    const isPromotion = (apiProduct.PROMOCAO || 0) === 1;
    const isImported = (apiProduct.IMPORTADO || 0) === 1;
    const isNew = (apiProduct.LANCAMENTO || 0) === 1;

    // Promotional price - Calculate based on promotion flag
    const promotionalPrice = calculatePromotionalPrice(
      normalPrice,
      isPromotion,
    );

    // Categories - Parse JSON string from CATEGORIAS field
    let categories: { ID_TAXONOMY: number; TAXONOMIA: string }[] | undefined;
    try {
      if (apiProduct.CATEGORIAS && typeof apiProduct.CATEGORIAS === "string") {
        const parsed = JSON.parse(apiProduct.CATEGORIAS);
        if (Array.isArray(parsed)) {
          categories = parsed;
        }
      }
    } catch (error) {
      // Silently fail - categories will be undefined
      logger.warn("Failed to parse CATEGORIAS JSON:", {
        productId: apiProduct.ID_PRODUTO,
        error,
      });
    }

    // Created date - Parse from API or use current date as fallback
    let createdAt: Date;
    try {
      createdAt = apiProduct.DATADOCADASTRO
        ? new Date(apiProduct.DATADOCADASTRO)
        : new Date();
    } catch {
      createdAt = new Date();
    }

    return {
      id,
      name,
      sku,
      image,
      normalPrice,
      promotionalPrice,
      wholesalePrice,
      corporatePrice,
      stock,
      category,
      brand,
      type,
      warrantyDays,
      isPromotion,
      isImported,
      isNew,
      categories,
      createdAt,
    };
  } catch (error) {
    logger.error("Error transforming API product to app product:", {
      apiProduct,
      error,
    });

    // Return a minimal valid product on error
    return {
      id: `error-${Date.now()}-${index || Math.random()}`,
      name: "Produto com erro",
      sku: "0",
      image: "/images/product/default-product.png",
      normalPrice: 0,
      wholesalePrice: 0,
      corporatePrice: 0,
      stock: 0,
      category: "Erro",
      brand: "Erro",
      warrantyDays: 0,
      isPromotion: false,
      isImported: false,
      isNew: false,
      createdAt: new Date(),
    };
  }
}

/**
 * Interface for search parameters
 */
export interface ProductSearchParams {
  searchTerm?: string;
  categoryId?: number;
  onlyInStock?: boolean;
  sortBy?: string;
  page?: number;
  perPage?: number;
}

/**
 * Map sortBy option to API parameters
 */
function mapSortToApiParams(sortBy?: string): {
  pe_coluna_id: number;
  pe_ordem_id: number;
} {
  switch (sortBy) {
    case "name-asc":
      return { pe_coluna_id: 1, pe_ordem_id: 1 }; // Nome A-Z
    case "name-desc":
      return { pe_coluna_id: 1, pe_ordem_id: 2 }; // Nome Z-A
    case "newest":
      return { pe_coluna_id: 2, pe_ordem_id: 2 }; // Mais Recente
    case "price-asc":
      return { pe_coluna_id: 3, pe_ordem_id: 1 }; // Menor Preço
    case "price-desc":
      return { pe_coluna_id: 3, pe_ordem_id: 2 }; // Maior Preço
    default:
      return { pe_coluna_id: 2, pe_ordem_id: 2 }; // Default: Mais Recente (newest)
  }
}

/**
 * Server Action to fetch products from API
 */
export async function fetchProducts(params: ProductSearchParams = {}): Promise<{
  success: boolean;
  products: Product[];
  total: number;
  error?: string;
}> {
  try {
    // Map sort option to API parameters
    const sortParams = mapSortToApiParams(params.sortBy);

    // Build API request parameters - only include meaningful values
    // Note: MariaDB pagination starts at 0, so we convert 1-based to 0-based
    const apiParams: Partial<FindProductsRequest> = {
      pe_flag_inativo: 0, // Only active products
      pe_qt_registros: params.perPage || 20,
      pe_pagina_id: (params.page || 1) - 1, // Convert 1-based to 0-based pagination
      pe_coluna_id: sortParams.pe_coluna_id,
      pe_ordem_id: sortParams.pe_ordem_id,
    };

    // Only include search term if not empty
    if (params.searchTerm && params.searchTerm.trim() !== "") {
      apiParams.pe_produto = params.searchTerm.trim();
    }

    // Only include category filter if it's a positive number
    if (params.categoryId && params.categoryId > 0) {
      apiParams.pe_id_taxonomy = params.categoryId;
    }

    // Only include stock filter if explicitly requested
    if (params.onlyInStock) {
      apiParams.pe_flag_estoque = 1;
    }

    // Call API service
    const response = await ProductServiceApi.findProducts(apiParams);

    // Validate response
    if (!ProductServiceApi.isValidProductListResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        products: [],
        total: 0,
        error: "Resposta inválida da API",
      };
    }

    // Extract products from response
    const apiProducts = ProductServiceApi.extractProductList(response);

    // Validate that we have a valid array
    if (!Array.isArray(apiProducts)) {
      logger.error("API response does not contain a valid product array:", {
        apiProducts,
      });
      return {
        success: false,
        products: [],
        total: 0,
        error: "Formato de resposta inválido da API",
      };
    }

    // Convert to application format with error handling
    const products = apiProducts
      .filter((product) => product && typeof product === "object") // Filter out null/invalid products
      .map((product, index) => {
        try {
          return transformApiProductToProduct(product, index);
        } catch (error) {
          logger.error("Error converting product:", { product, error });
          return null;
        }
      })
      .filter((product): product is Product => product !== null); // Filter out failed conversions

    /*     logger.info(
      `Successfully fetched ${products.length} products from ${apiProducts.length} API products`,
    ); */

    return {
      success: true,
      products,
      total: response.quantity || products.length,
      error: undefined,
    };
  } catch (error) {
    logger.error("Error fetching products:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar produtos";

    return {
      success: false,
      products: [],
      total: 0,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to fetch products with advanced filters
 * Note: Uses 1-based pagination for frontend consistency, converts to 0-based for API
 */
export async function fetchProductsWithFilters(
  searchTerm: string = "",
  categoryId: string = "all",
  onlyInStock: boolean = false,
  sortBy: string = "name-asc",
  page: number = 1,
  perPage: number = 20,
): Promise<{
  success: boolean;
  products: Product[];
  total: number;
  error?: string;
}> {
  try {
    // Convert category filter - only include if not "all"
    const params: ProductSearchParams = {
      onlyInStock,
      sortBy,
      page,
      perPage,
    };

    // Only include search term if not empty
    if (searchTerm.trim() !== "") {
      params.searchTerm = searchTerm.trim();
    }

    // Only include category if not "all" and is a valid number
    if (categoryId !== "all") {
      const numericCategoryId = parseInt(categoryId, 10);
      if (!Number.isNaN(numericCategoryId) && numericCategoryId > 0) {
        params.categoryId = numericCategoryId;
      }
    }

    return await fetchProducts(params);
  } catch (error) {
    logger.error("Error in fetchProductsWithFilters:", error);

    return {
      success: false,
      products: [],
      total: 0,
      error: "Erro ao buscar produtos com filtros",
    };
  }
}

// ========================================
// CREATE PRODUCT ACTION
// ========================================

/**
 * Interface for creating a new product
 */
export interface CreateProductData {
  name: string;
  slug?: string; // Now optional - will be auto-generated from name
  reference?: string;
  model?: string;
  description?: string;
  tags?: string;
  brandId?: number;
  typeId?: number; // ID do Tipo
  wholesalePrice?: number; // Preço Atacado
  retailPrice?: number; // Preço Varejo
  corporatePrice?: number; // Preço Corporativo
  stock?: number;
  businessType?: number;
  additionalInfo?: string;
}

/**
 * Server Action to create a new product from FormData (used with Next.js Form component)
 */
export async function createProductFromForm(formData: FormData): Promise<{
  success: boolean;
  productId?: number;
  error?: string;
}> {
  try {
    // Extract data from FormData
    const name = formData.get("name") as string;
    const reference = formData.get("reference") as string;
    const additionalInfo = formData.get("additionalInfo") as string;

    // Set description, tags, and model as empty strings (server-side)
    const description = "";
    const tags = "";
    const model = "";

    // Parse numeric values with fallbacks
    const wholesalePrice =
      parseFloat(formData.get("wholesalePrice") as string) || 0;
    const retailPrice = parseFloat(formData.get("retailPrice") as string) || 0;
    const corporatePrice =
      parseFloat(formData.get("corporatePrice") as string) || 0;
    const stock = parseInt(formData.get("stock") as string, 10) || 0;
    const brandId = parseInt(formData.get("brandId") as string, 10) || 0;
    const typeId = parseInt(formData.get("typeId") as string, 10) || 0;
    const businessType =
      parseInt(formData.get("businessType") as string, 10) || 1;

    // Auto-generate slug from product name
    const slug = generateSlugFromName(name);

    // Validate that we have a name to work with
    if (!name || !name.trim()) {
      return {
        success: false,
        error: "Nome do produto é obrigatório",
      };
    }

    // Validate generated slug
    if (!slug || slug.length < 2) {
      return {
        success: false,
        error:
          "Não foi possível gerar um slug válido a partir do nome do produto",
      };
    }

    // Prepare API request data - todos os parâmetros conforme API Reference
    const apiData = {
      // Tipo de negócio (obrigatório)
      pe_type_business: businessType, // From FormData

      // Dados básicos do produto (obrigatórios)
      pe_nome_produto: name,
      pe_slug: slug, // Auto-generated slug

      // Dados básicos opcionais
      pe_descricao_tab: description || "",
      pe_etiqueta: tags || "",
      pe_ref: reference || "",
      pe_modelo: model || "",

      // Relacionamentos opcionais
      pe_id_fornecedor: 0, // Default: sem fornecedor
      pe_id_tipo: typeId, // ID do Tipo do formulário
      pe_id_marca: brandId, // ID da Marca do formulário
      pe_id_familia: 0, // Default: sem família
      pe_id_grupo: 0, // Default: sem grupo
      pe_id_subgrupo: 0, // Default: sem subgrupo

      // Características físicas opcionais
      pe_peso_gr: 0,
      pe_comprimento_mm: 0,
      pe_largura_mm: 0,
      pe_altura_mm: 0,
      pe_diametro_mm: 0,
      pe_tempodegarantia_mes: 0,

      // Preços (obrigatórios no formulário)
      pe_vl_venda_atacado: wholesalePrice, // Preço Atacado
      pe_vl_venda_varejo: retailPrice, // Preço Varejo
      pe_vl_corporativo: corporatePrice, // Preço Corporativo

      // Estoque e flags opcionais
      pe_qt_estoque: stock,
      pe_flag_website_off: 0, // Default: website ativo
      pe_flag_importado: 2, // Default: produto importado

      // Informações adicionais opcionais
      pe_info: additionalInfo || "",
    }; // Call API service
    const response = await ProductServiceApi.createProduct(apiData);

    // Validate response
    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage = spResponse?.sp_message || "Erro ao criar produto";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Extract product ID from response
    const productId = ProductServiceApi.extractRecordId(response);

    if (!productId) {
      logger.error("No product ID returned from API:", response);
      return {
        success: false,
        error: "ID do produto não foi retornado",
      };
    }

    return {
      success: true,
      productId,
    };
  } catch (error) {
    logger.error("Error creating product:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao criar produto";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to create a new product (original version for object data)
 */
export async function createProduct(data: CreateProductData): Promise<{
  success: boolean;
  productId?: number;
  error?: string;
}> {
  try {
    // Auto-generate slug from product name if not provided
    const slug = data.slug || generateSlugFromName(data.name);

    // Validate that we have a name to work with
    if (!data.name || !data.name.trim()) {
      return {
        success: false,
        error: "Nome do produto é obrigatório",
      };
    }

    // Validate generated slug
    if (!slug || slug.length < 2) {
      return {
        success: false,
        error:
          "Não foi possível gerar um slug válido a partir do nome do produto",
      };
    }

    // Prepare API request data - todos os parâmetros conforme API Reference
    const apiData = {
      // Tipo de negócio (obrigatório)
      pe_type_business: 1, // Default: 1 (venda para consumidor final) - can be made dynamic if needed
      // Dados básicos do produto (obrigatórios)
      pe_nome_produto: data.name,
      pe_slug: slug, // Use auto-generated slug

      // Dados básicos opcionais
      pe_descricao_tab: data.description || "",
      pe_etiqueta: data.tags || "",
      pe_ref: data.reference || "",
      pe_modelo: data.model || "",

      // Relacionamentos opcionais
      pe_id_fornecedor: 0, // Default: sem fornecedor
      pe_id_tipo: data.typeId || 0, // ID do Tipo
      pe_id_marca: data.brandId || 0,
      pe_id_familia: 0, // Default: sem família
      pe_id_grupo: 0, // Default: sem grupo
      pe_id_subgrupo: 0, // Default: sem subgrupo

      // Características físicas opcionais
      pe_peso_gr: 0,
      pe_comprimento_mm: 0,
      pe_largura_mm: 0,
      pe_altura_mm: 0,
      pe_diametro_mm: 0,
      pe_tempodegarantia_mes: 0,

      // Preços (obrigatórios no formulário)
      pe_vl_venda_atacado: data.wholesalePrice || 0, // Preço Atacado
      pe_vl_venda_varejo: data.retailPrice || 0, // Preço Varejo
      pe_vl_corporativo: data.corporatePrice || 0, // Preço Corporativo

      // Estoque e flags opcionais
      pe_qt_estoque: data.stock || 0,
      pe_flag_website_off: 0, // Default: website ativo
      pe_flag_importado: 2, // Default: produto importado

      // Informações adicionais opcionais
      pe_info: data.additionalInfo || "",
    }; // Call API service
    const response = await ProductServiceApi.createProduct(apiData);

    // Validate response
    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage = spResponse?.sp_message || "Erro ao criar produto";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Extract product ID from response
    const productId = ProductServiceApi.extractRecordId(response);

    if (!productId) {
      logger.error("No product ID returned from API:", response);
      return {
        success: false,
        error: "ID do produto não foi retornado",
      };
    }

    return {
      success: true,
      productId,
    };
  } catch (error) {
    logger.error("Error creating product:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao criar produto";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========================================
// UPDATE PRODUCT ACTIONS
// ========================================

/**
 * Server Action to update general product data
 */
export async function updateProductGeneral(data: {
  productId: number;
  productName: string;
  descriptionTab: string;
  label: string;
  reference: string;
  model: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await ProductServiceApi.updateProductGeneral({
      pe_id_produto: data.productId,
      pe_nome_produto: data.productName,
      pe_ref: data.reference,
      pe_modelo: data.model,
      pe_etiqueta: data.label,
      pe_descricao_tab: data.descriptionTab,
    });

    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar dados gerais";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product general data:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar dados gerais";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to update product characteristics
 */
export async function updateProductCharacteristics(data: {
  productId: number;
  weightGr: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  diameterMm: number;
  warrantyDays: number;
  warrantyMonths: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await ProductServiceApi.updateProductCharacteristics({
      pe_id_produto: data.productId,
      pe_peso_gr: data.weightGr,
      pe_comprimento_mm: data.lengthMm,
      pe_largura_mm: data.widthMm,
      pe_altura_mm: data.heightMm,
      pe_diametro_mm: data.diameterMm,
      pe_tempodegarantia_dia: data.warrantyDays,
      pe_tempodegarantia_mes: data.warrantyMonths,
    });

    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar características";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product characteristics:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar características";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to update product tax values
 */
export async function updateProductTaxValues(data: {
  productId: number;
  cfop: string;
  cst: string;
  ean: string;
  ncm: number;
  nbm: string;
  ppb: number;
  temp: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await ProductServiceApi.updateProductTaxValues({
      pe_id_produto: data.productId,
      pe_cfop: data.cfop,
      pe_cst: data.cst,
      pe_ean: data.ean,
      pe_nbm: data.nbm,
      pe_ncm: data.ncm,
      pe_ppb: data.ppb,
      pe_temp: Number(data.temp),
    });

    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar valores fiscais";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product tax values:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar valores fiscais";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to update product flags
 */
export async function updateProductFlags(data: {
  productId: number;
  controleFisico: number;
  controlarEstoque: number;
  consignado: number;
  destaque: number;
  promocao: number;
  servico: number;
  websiteOff: number;
  inativo: number;
  importado: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await ProductServiceApi.updateProductFlags({
      pe_id_produto: data.productId,
      pe_flag_controle_fisico: data.controleFisico,
      pe_flag_controle_estoque: data.controlarEstoque,
      pe_flag_descontinuado: data.consignado,
      pe_flag_destaque: data.destaque,
      pe_flag_promocao: data.promocao,
      pe_flag_servico: data.servico,
      pe_flag_website_off: data.websiteOff,
      pe_flag_inativo: data.inativo,
      pe_flag_importado: data.importado,
    });

    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage = spResponse?.sp_message || "Erro ao atualizar flags";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product flags:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar flags";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
