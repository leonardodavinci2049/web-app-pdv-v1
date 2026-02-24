/**
 * Product service for interacting with the API
 * Based on API Reference: .github/api-reference/api-product-reference.md
 */

import "server-only";

import { envs } from "@/core/config";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  PRODUCT_ENDPOINTS,
} from "@/lib/constants/api-constants";
import { createLogger } from "@/lib/logger";

import type {
  CreateProductRequest,
  CreateProductResponse,
  FindProductByIdRequest,
  FindProductByIdResponse,
  FindProductsRequest,
  FindProductsResponse,
  ProductDetail,
  ProductListItem,
  ProductRelatedTaxonomy,
  ProductSupplier,
  StoredProcedureResponse,
  UpdateProductBrandRequest,
  UpdateProductCharacteristicsRequest,
  UpdateProductDescriptionRequest,
  UpdateProductFlagsRequest,
  UpdateProductGeneralRequest,
  UpdateProductImagePathRequest,
  UpdateProductMetadataRequest,
  UpdateProductNameRequest,
  UpdateProductPriceRequest,
  UpdateProductResponse,
  UpdateProductShortDescriptionRequest,
  UpdateProductStockRequest,
  UpdateProductTaxValuesRequest,
  UpdateProductTypeRequest,
  UpdateProductVariousRequest,
} from "./types/product-types";

import {
  CreateProductSchema,
  FindProductByIdSchema,
  FindProductsSchema,
  UpdateProductBrandSchema,
  UpdateProductCharacteristicsSchema,
  UpdateProductDescriptionSchema,
  UpdateProductFlagsSchema,
  UpdateProductGeneralSchema,
  UpdateProductImagePathSchema,
  UpdateProductMetadataSchema,
  UpdateProductNameSchema,
  UpdateProductPriceSchema,
  UpdateProductShortDescriptionSchema,
  UpdateProductStockSchema,
  UpdateProductTaxValuesSchema,
  UpdateProductTypeSchema,
  UpdateProductVariousSchema,
} from "./validation/product-schemas";

// Logger instance
const logger = createLogger("ProductService");

/**
 * Service for product-related operations
 */
export class ProductServiceApi extends BaseApiService {
  /**
   * Build base payload with environment variables
   * Valores obtidos dinamicamente do .env - podem variar por ambiente/usuário
   * Os valores na documentação da API são apenas exemplos de demonstração
   */
  private static buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_system_client_id: 1,
      pe_store_id: 1,
      pe_organization_id: 'xxx',
      pe_member_id: 'xxx',
      pe_user_id: '',
      pe_person_id: '1937', // Valor dinâmico das variáveis de ambiente
      ...additionalData,
    };
  }

  // ========================================
  // QUERY METHODS
  // ========================================

  /**
   * ENDPOINT 1 - Find product by ID or slug
   * Based on API Reference: product-find-id.md
   * @param params - Search parameters
   * @returns Promise with product details
   */
  static async findProductById(
    params: Partial<FindProductByIdRequest> & {
      pe_type_business: number;
      pe_id_produto: number;
    },
  ): Promise<FindProductByIdResponse> {
    try {
      // Validate parameters
      const validatedParams = FindProductByIdSchema.parse({
        pe_type_business: params.pe_type_business,
        pe_id_produto: params.pe_id_produto,
        pe_slug_produto: params.pe_slug_produto,
      });

      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const data: FindProductByIdResponse =
        await instance.post<FindProductByIdResponse>(
          PRODUCT_ENDPOINTS.FIND_BY_ID,
          requestBody,
        );

      // Check if the search was successful using utility function
      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao buscar produto por ID");
      }

      return data;
    } catch (error) {
      logger.error("Erro no serviço de produto (busca por ID)", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 2 - List products with filters and pagination
   * Based on API Reference: product-find.md
   * @param params - Search and pagination parameters (all optional)
   * @returns Promise with product list
   */
  static async findProducts(
    params: Partial<FindProductsRequest> = {},
  ): Promise<FindProductsResponse> {
    try {
      const validatedParams = ProductServiceApi.validateSearchParams(params);
      const requestBody =
        ProductServiceApi.buildProductSearchPayload(validatedParams);

      // console.log("Request Body findProductById:", requestBody);

      const response =
        await ProductServiceApi.executeProductSearch(requestBody);

      const result = ProductServiceApi.handleSearchResponse(response);

      // Log para visualizar a lista de produtos (JSON completo)
      /*       logger.info(
        "findProducts - Lista de produtos:",
        JSON.stringify(result.data?.[0], null, 2),
      ); */

      return result;
    } catch (error) {
      logger.error("Erro no serviço de produto (busca)", error);
      throw error;
    }
  }

  /**
   * Validate search parameters
   * @private
   */
  private static validateSearchParams(
    params: Partial<FindProductsRequest>,
  ): Partial<FindProductsRequest> {
    try {
      return FindProductsSchema.partial().parse(params);
    } catch (error) {
      logger.error("Erro na validação de parâmetros de busca", error);
      throw error;
    }
  }

  /**
   * Build search payload with default values
   * Based on API Reference: product-find.md
   * @private
   */
  private static buildProductSearchPayload(
    params: Partial<FindProductsRequest>,
  ): Record<string, unknown> {
    // Build clean parameters object, only including non-zero/non-empty values
    const cleanParams: Partial<FindProductsRequest> = {};

    // Filtros - Only include if meaningful values are provided

    // Filtrar por taxonomia/categoria - only if positive number
    if (params.pe_id_taxonomy && params.pe_id_taxonomy > 0) {
      cleanParams.pe_id_taxonomy = params.pe_id_taxonomy;
    }

    // Slug da categoria - only if not empty
    if (params.pe_slug_taxonomy && params.pe_slug_taxonomy.trim() !== "") {
      cleanParams.pe_slug_taxonomy = params.pe_slug_taxonomy;
    }

    // Filtrar por ID específico de produto - only if positive number
    if (params.pe_id_produto && params.pe_id_produto > 0) {
      cleanParams.pe_id_produto = params.pe_id_produto;
    }

    // Busca por nome (LIKE) - only if not empty
    if (params.pe_produto && params.pe_produto.trim() !== "") {
      cleanParams.pe_produto = params.pe_produto;
    }

    // Include parameters with their API defaults
    const payload = ProductServiceApi.buildBasePayload({
      pe_slug_taxonomy: "", // Required field - vazio para não filtrar por slug
      pe_flag_inativo: params.pe_flag_inativo ?? 0, // Default: 0 = apenas produtos ativos
      pe_qt_registros: params.pe_qt_registros ?? 20, // Default: 20 registros por página
      pe_pagina_id: params.pe_pagina_id ?? 0, // Default: 0 = primeira página
      pe_coluna_id: params.pe_coluna_id ?? 1, // Default: 1 = primeira coluna para ordenação
      pe_ordem_id: params.pe_ordem_id ?? 1, // Default: 1 = ASC
      ...cleanParams, // Include only the meaningful filter parameters
    });

    // Add stock filter only if explicitly requested
    if (params.pe_flag_estoque !== undefined) {
      payload.pe_flag_estoque = params.pe_flag_estoque;
    }

    return payload;
  }

  /**
   * Execute product search on API
   * @private
   */
  private static async executeProductSearch(
    requestBody: Record<string, unknown>,
  ): Promise<FindProductsResponse> {
    const instance = new ProductServiceApi();
    return await instance.post<FindProductsResponse>(
      PRODUCT_ENDPOINTS.FIND,
      requestBody,
    );
  }

  /**
   * Handle search response
   * @private
   */
  private static handleSearchResponse(
    data: FindProductsResponse,
  ): FindProductsResponse {
    // Check if it's empty result or not found code
    if (
      data.statusCode === API_STATUS_CODES.EMPTY_RESULT ||
      data.statusCode === API_STATUS_CODES.NOT_FOUND ||
      data.statusCode === API_STATUS_CODES.UNPROCESSABLE
    ) {
      return {
        ...data,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: [
          [],
          {
            fieldCount: 0,
            affectedRows: 0,
            insertId: 0,
            info: "",
            serverStatus: 0,
            warningStatus: 0,
            changedRows: 0,
          },
        ],
      };
    }

    // Check if the search was successful using utility function
    if (isApiError(data.statusCode)) {
      throw new Error(data.message || "Erro ao buscar produtos");
    }

    return data;
  }

  // ========================================
  // CREATE METHOD
  // ========================================

  /**
   * ENDPOINT 6 - Create new product
   * @param params - New product parameters
   * @returns Promise with creation response
   */
  static async createProduct(
    params: Partial<CreateProductRequest> & {
      pe_type_business: number;
      pe_nome_produto: string;
      pe_slug: string;
    },
  ): Promise<CreateProductResponse> {
    try {
      // Validate parameters
      const validatedParams = CreateProductSchema.parse({
        pe_type_business: params.pe_type_business,
        pe_nome_produto: params.pe_nome_produto,
        pe_slug: params.pe_slug,
        pe_descricao_tab: params.pe_descricao_tab,
        pe_etiqueta: params.pe_etiqueta,
        pe_ref: params.pe_ref,
        pe_modelo: params.pe_modelo,
        pe_id_fornecedor: params.pe_id_fornecedor,
        pe_id_tipo: params.pe_id_tipo,
        pe_id_marca: params.pe_id_marca,
        pe_id_familia: params.pe_id_familia,
        pe_id_grupo: params.pe_id_grupo,
        pe_id_subgrupo: params.pe_id_subgrupo,
        pe_peso_gr: params.pe_peso_gr,
        pe_comprimento_mm: params.pe_comprimento_mm,
        pe_largura_mm: params.pe_largura_mm,
        pe_altura_mm: params.pe_altura_mm,
        pe_diametro_mm: params.pe_diametro_mm,
        pe_tempodegarantia_mes: params.pe_tempodegarantia_mes,
        pe_vl_venda_atacado: params.pe_vl_venda_atacado,
        pe_vl_venda_varejo: params.pe_vl_venda_varejo,
        pe_vl_corporativo: params.pe_vl_corporativo,
        pe_qt_estoque: params.pe_qt_estoque,
        pe_flag_website_off: params.pe_flag_website_off,
        pe_flag_importado: params.pe_flag_importado,
        pe_info: params.pe_info,
      });

      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: CreateProductResponse =
        await instance.post<CreateProductResponse>(
          PRODUCT_ENDPOINTS.CREATE,
          requestBody,
        );

      // Check if creation was successful using utility function
      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao criar produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro no serviço de criação de produto", error);
      throw error;
    }
  }

  // ========================================
  // UPDATE METHODS
  // ========================================

  /**
   * ENDPOINT 7 - Update general product data
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductGeneral(
    params: Partial<UpdateProductGeneralRequest> & {
      pe_id_produto: number;
      pe_nome_produto: string;
      pe_ref: string;
      pe_modelo: string;
      pe_etiqueta: string;
      pe_descricao_tab: string;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductGeneralSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_GENERAL,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar dados gerais");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar dados gerais do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 8 - Update product name
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductName(
    params: Partial<UpdateProductNameRequest> & {
      pe_id_produto: number;
      pe_nome_produto: string;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductNameSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_NAME,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar nome do produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar nome do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 9 - Update product type
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductType(
    params: Partial<UpdateProductTypeRequest> & {
      pe_id_produto: number;
      pe_id_tipo: number;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductTypeSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_TYPE,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar tipo do produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar tipo do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 10 - Update product brand
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductBrand(
    params: Partial<UpdateProductBrandRequest> & {
      pe_id_produto: number;
      pe_id_marca: number;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductBrandSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_BRAND,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar marca do produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar marca do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 11 - Update product stock
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductStock(
    params: Partial<UpdateProductStockRequest> & {
      pe_id_produto: number;
      pe_qt_estoque: number;
      pe_qt_minimo: number;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductStockSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_STOCK,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar estoque do produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar estoque do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 12 - Update product prices
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductPrice(
    params: Partial<UpdateProductPriceRequest> & {
      pe_id_produto: number;
      pe_preco_venda_atac: number;
      pe_preco_venda_corporativo: number;
      pe_preco_venda_vare: number;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductPriceSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_PRICE,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar preços do produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar preços do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 13 - Update product flags
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductFlags(
    params: Partial<UpdateProductFlagsRequest> & {
      pe_id_produto: number;
      pe_flag_inativo: number;
      pe_flag_importado: number;
      pe_flag_controle_fisico: number;
      pe_flag_controle_estoque: number;
      pe_flag_destaque: number;
      pe_flag_promocao: number;
      pe_flag_descontinuado: number;
      pe_flag_servico: number;
      pe_flag_website_off: number;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductFlagsSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_FLAGS,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar flags do produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar flags do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 14 - Update product characteristics
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductCharacteristics(
    params: Partial<UpdateProductCharacteristicsRequest> & {
      pe_id_produto: number;
      pe_peso_gr: number;
      pe_comprimento_mm: number;
      pe_largura_mm: number;
      pe_altura_mm: number;
      pe_diametro_mm: number;
      pe_tempodegarantia_dia: number;
      pe_tempodegarantia_mes: number;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductCharacteristicsSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_CHARACTERISTICS,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar características do produto",
        );
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar características do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 15 - Update product tax values
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductTaxValues(
    params: Partial<UpdateProductTaxValuesRequest> & {
      pe_id_produto: number;
      pe_cfop: string;
      pe_cst: string;
      pe_ean: string;
      pe_nbm: string;
      pe_ncm: number;
      pe_ppb: number;
      pe_temp: number;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductTaxValuesSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_TAX_VALUES,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar valores fiscais do produto",
        );
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar valores fiscais do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 16 - Update product short description
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductShortDescription(
    params: Partial<UpdateProductShortDescriptionRequest> & {
      pe_id_produto: number;
      pe_descricao_venda: string;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductShortDescriptionSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_SHORT_DESCRIPTION,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar descrição curta do produto",
        );
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar descrição curta do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 17 - Update product full description
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductDescription(
    params: Partial<UpdateProductDescriptionRequest> & {
      pe_id_produto: number;
      pe_produto_descricao: string;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductDescriptionSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_DESCRIPTION,
          requestBody,
        );

      // console.log("updateProductDescription - Response:", data);

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar descrição completa do produto",
        );
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar descrição completa do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 18 - Update various product data
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductVarious(
    params: Partial<UpdateProductVariousRequest> & {
      pe_id_produto: number;
      pe_nome_produto: string;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductVariousSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_VARIOUS,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar dados diversos do produto",
        );
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar dados diversos do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 19 - Update product image path
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductImagePath(
    params: Partial<UpdateProductImagePathRequest> & {
      pe_id_produto: number;
      pe_path_imagem: string;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductImagePathSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_IMAGE_PATH,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar caminho da imagem do produto",
        );
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar caminho da imagem do produto", error);
      throw error;
    }
  }

  /**
   * ENDPOINT 20 - Update product metadata (meta title and meta description)
   * @param params - Update parameters
   * @returns Promise with update response
   */
  static async updateProductMetadata(
    params: Partial<UpdateProductMetadataRequest> & {
      pe_id_produto: number;
      pe_meta_title: string;
      pe_meta_description: string;
    },
  ): Promise<UpdateProductResponse> {
    try {
      const validatedParams = UpdateProductMetadataSchema.parse(params);
      const instance = new ProductServiceApi();
      const requestBody = ProductServiceApi.buildBasePayload(validatedParams);

      const data: UpdateProductResponse =
        await instance.post<UpdateProductResponse>(
          PRODUCT_ENDPOINTS.UPDATE_METADATA,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar metadados do produto",
        );
      }

      return data;
    } catch (error) {
      logger.error("Erro ao atualizar metadados do produto", error);
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Extract product detail from API response
   * @param response - API response
   * @returns Product detail or null
   */
  static extractProductDetail(
    response: FindProductByIdResponse,
  ): ProductDetail | null {
    return response.data?.[0]?.[0] ?? null;
  }

  /**
   * Extract related taxonomies/categories from API response
   * @param response - API response
   * @returns Related taxonomies array or empty array
   */
  static extractRelatedTaxonomies(
    response: FindProductByIdResponse,
  ): ProductRelatedTaxonomy[] {
    return response.data?.[1] ?? [];
  }

  /**
   * Extract suppliers from API response
   * @param response - API response
   * @returns Suppliers array or empty array
   */
  static extractSuppliers(
    response: FindProductByIdResponse,
  ): ProductSupplier[] {
    return response.data?.[2] ?? [];
  }

  /**
   * Extract product list from API response
   * @param response - API response
   * @returns Product list or empty array
   */
  static extractProductList(response: FindProductsResponse): ProductListItem[] {
    return response.data?.[0] ?? [];
  }

  /**
   * Extract stored procedure response
   * @param response - API response with stored procedure
   * @returns Stored procedure response or null
   */
  static extractStoredProcedureResponse(
    response: CreateProductResponse | UpdateProductResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[0]?.[0] ?? null;
  }

  /**
   * Extract record ID from created/updated product
   * @param response - API response
   * @returns Record ID or null
   */
  static extractRecordId(
    response: CreateProductResponse | UpdateProductResponse,
  ): number | null {
    const spResponse =
      ProductServiceApi.extractStoredProcedureResponse(response);
    return spResponse ? spResponse.sp_return_id : null;
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  /**
   * Validate if product detail response is valid
   * @param response - API response
   * @returns true if valid, false otherwise
   */
  static isValidProductDetailResponse(
    response: FindProductByIdResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0]) &&
      response.data[0].length > 0
    );
  }

  /**
   * Validate if product list response is valid
   * @param response - API response
   * @returns true if valid, false otherwise
   */
  static isValidProductListResponse(response: FindProductsResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }

  /**
   * Validate if operation response (create/update) is valid
   * @param response - API response
   * @returns true if valid, false otherwise
   */
  static isValidOperationResponse(
    response: CreateProductResponse | UpdateProductResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      response.data[0] &&
      response.data[0][0] !== undefined
    );
  }

  /**
   * Check if operation was successful based on stored procedure
   * @param response - API response
   * @returns true if successful, false otherwise
   */
  static isOperationSuccessful(
    response: CreateProductResponse | UpdateProductResponse,
  ): boolean {
    const spResponse =
      ProductServiceApi.extractStoredProcedureResponse(response);
    return spResponse ? spResponse.sp_error_id === 0 : false;
  }
}
