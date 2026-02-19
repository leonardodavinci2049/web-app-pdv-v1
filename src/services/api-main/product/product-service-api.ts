import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  PRODUCT_WEB_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  ProductWebDetail,
  ProductWebFindByIdRequest,
  ProductWebFindByIdResponse,
  ProductWebFindRequest,
  ProductWebFindResponse,
  ProductWebListItem,
  ProductWebRelatedItem,
  ProductWebRelatedTaxonomy,
  ProductWebSectionItem,
  ProductWebSectionsRequest,
  ProductWebSectionsResponse,
} from "./types/product-types";
import {
  ProductWebError,
  ProductWebNotFoundError,
} from "./types/product-types";
import {
  ProductWebFindByIdSchema,
  ProductWebFindSchema,
  ProductWebSectionsSchema,
} from "./validation/product-schemas";

const logger = createLogger("ProductWebService");

/**
 * Serviço para integração com a API de Produtos Web
 */
export class ProductWebServiceApi extends BaseApiService {
  /**
   * Monta o payload base com as credenciais do sistema
   */
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_system_client_id: envs.SYSTEM_CLIENT_ID,
      pe_store_id: envs.STORE_ID,
      pe_organization_id: envs.ORGANIZATION_ID,
      pe_user_id: envs.USER_ID,
      pe_member_role: envs.MEMBER_ROLE,
      pe_person_id: envs.PERSON_ID,
      ...additionalData,
    };
  }

  /**
   * Busca produto por ID ou Slug
   */
  async findProductById(
    params: Partial<ProductWebFindByIdRequest> &
      Pick<ProductWebFindByIdRequest, "pe_id_produto" | "pe_slug_produto">,
  ): Promise<ProductWebFindByIdResponse> {
    try {
      const payloadInput = {
        pe_type_business: params.pe_type_business ?? envs.TYPE_BUSINESS,
        pe_id_produto: params.pe_id_produto,
        pe_slug_produto: params.pe_slug_produto,
      };

      const validatedParams = ProductWebFindByIdSchema.parse(payloadInput);

      const requestBody = this.buildBasePayload({
        ...validatedParams,
      });

      const response = await this.post<ProductWebFindByIdResponse>(
        PRODUCT_WEB_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      // Trata erro de negócio (Produto não encontrado)
      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new ProductWebNotFoundError(validatedParams);
      }

      // Trata outros erros de negócio da API
      if (isApiError(response.statusCode)) {
        throw new ProductWebError(
          response.message || "Erro ao buscar produto web por ID",
          "PRODUCT_WEB_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      const hasProductData =
        Array.isArray(response.data?.[0]) && response.data[0].length > 0;

      if (!hasProductData) {
        throw new ProductWebNotFoundError(validatedParams);
      }

      return response;
    } catch (error) {
      logger.error("Erro no serviço de produto web (busca por ID)", error);
      throw error;
    }
  }

  /**
   * Busca lista de produtos com filtros
   */
  async findProducts(
    params: Partial<ProductWebFindRequest> = {},
  ): Promise<ProductWebFindResponse> {
    try {
      const validatedParams = this.validateSearchParams(params);
      const requestBody = this.buildSearchPayload(validatedParams);

      const response = await this.post<ProductWebFindResponse>(
        PRODUCT_WEB_ENDPOINTS.FIND,
        requestBody,
      );

      return this.normalizeEmptyResponse(response, "Nenhum produto encontrado");
    } catch (error) {
      logger.error("Erro no serviço de produto web (busca)", error);
      throw error;
    }
  }

  /**
   * Busca seções de produtos web
   */
  async findProductWebSections(
    params: Partial<ProductWebSectionsRequest> = {},
  ): Promise<ProductWebSectionsResponse> {
    try {
      const validatedParams = this.validateSectionsParams(params);
      const requestBody = this.buildSectionsPayload(validatedParams);

      const response = await this.post<ProductWebSectionsResponse>(
        PRODUCT_WEB_ENDPOINTS.SECTIONS,
        requestBody,
      );

      return this.normalizeEmptyResponse(
        response,
        "Nenhuma seção de produto encontrada",
      );
    } catch (error) {
      logger.error("Erro no serviço de seções web de produtos", error);
      throw error;
    }
  }

  private validateSearchParams(
    params: Partial<ProductWebFindRequest>,
  ): Partial<ProductWebFindRequest> {
    try {
      return ProductWebFindSchema.partial().parse(params);
    } catch (error) {
      logger.error(
        "Erro na validação de parâmetros de busca Product Web",
        error,
      );
      throw error;
    }
  }

  private buildSearchPayload(
    params: Partial<ProductWebFindRequest>,
  ): Record<string, unknown> {
    return this.buildBasePayload({
      pe_id_taxonomy: params.pe_id_taxonomy ?? 0,
      pe_slug_taxonomy: params.pe_slug_taxonomy ?? "",
      pe_id_produto: params.pe_id_produto ?? 0,
      pe_produto: params.pe_produto ?? "",
      pe_id_marca: params.pe_id_marca ?? 0,
      pe_flag_estoque: params.pe_flag_estoque ?? 0,
      pe_qt_registros: params.pe_qt_registros ?? 30,
      pe_pagina_id: params.pe_pagina_id ?? 0,
      pe_coluna_id: params.pe_coluna_id ?? 1,
      pe_ordem_id: params.pe_ordem_id ?? 1,
    });
  }

  private validateSectionsParams(
    params: Partial<ProductWebSectionsRequest>,
  ): Partial<ProductWebSectionsRequest> {
    try {
      return ProductWebSectionsSchema.partial().parse(params);
    } catch (error) {
      logger.error(
        "Erro na validação de parâmetros de seções web de produtos",
        error,
      );
      throw error;
    }
  }

  private buildSectionsPayload(
    params: Partial<ProductWebSectionsRequest>,
  ): Record<string, unknown> {
    return this.buildBasePayload({
      pe_id_taxonomy: params.pe_id_taxonomy ?? 0,
      pe_id_marca: params.pe_id_marca ?? 0,
      pe_id_tipo: params.pe_id_tipo ?? 0,
      pe_flag_promotions: params.pe_flag_promotions ?? 0,
      pe_flag_highlight: params.pe_flag_highlight ?? 0,
      pe_flag_lancamento: params.pe_flag_lancamento ?? 0,
      pe_qt_registros: params.pe_qt_registros ?? 30,
      pe_pagina_id: params.pe_pagina_id ?? 0,
      pe_coluna_id: params.pe_coluna_id ?? 1,
      pe_ordem_id: params.pe_ordem_id ?? 1,
    });
  }

  // ============================================================================
  // Métodos Utilitários (Extração de dados)
  // ============================================================================

  extractProduct(
    response: ProductWebFindByIdResponse,
  ): ProductWebDetail | null {
    return response.data?.[0]?.[0] ?? null;
  }

  extractTaxonomies(
    response: ProductWebFindByIdResponse,
  ): ProductWebRelatedTaxonomy[] {
    return response.data?.[1] ?? [];
  }

  extractRelatedProducts(
    response: ProductWebFindByIdResponse,
  ): ProductWebRelatedItem[] {
    return response.data?.[2] ?? [];
  }

  extractProductList(response: ProductWebFindResponse): ProductWebListItem[] {
    return response.data?.[0] ?? [];
  }

  extractProductSections(
    response: ProductWebSectionsResponse,
  ): ProductWebSectionItem[] {
    return response.data?.[0] ?? [];
  }

  isValidProductDetail(response: ProductWebFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0]) &&
      response.data[0].length > 0
    );
  }

  isValidProductList(response: ProductWebFindResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }

  isValidProductSections(response: ProductWebSectionsResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }
}

/**
 * Instância única do serviço de produto web
 */
export const productServiceApi = new ProductWebServiceApi();
