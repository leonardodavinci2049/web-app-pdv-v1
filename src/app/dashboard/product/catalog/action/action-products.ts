"use server";

import { createLogger } from "@/lib/logger";
import { ProductServiceApi } from "@/services/api/product/product-service-api";
import type {
  FindProductsRequest,
  ProductListItem,
} from "@/services/api/product/types/product-types";
import type { Product } from "@/types/types";
import { getValidImageUrl } from "@/utils/image-utils";

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
