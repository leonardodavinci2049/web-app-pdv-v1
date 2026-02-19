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
  StoredProcedureResponse,
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

export class ProductWebServiceApi extends BaseApiService {
  private static buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_system_client_id: envs.SYSTEM_CLIENT_ID,
      pe_store_id: envs.STORE_ID,
      pe_organization_id: envs.ORGANIZATION_ID,
      pe_member_id: envs.MEMBER_ID,
      pe_user_id: envs.USER_ID,
      pe_person_id: envs.PERSON_ID,
      ...additionalData,
    };
  }

  static async findProductById(
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

      const instance = new ProductWebServiceApi();
      const requestBody = ProductWebServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const response = await instance.post<ProductWebFindByIdResponse>(
        PRODUCT_WEB_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new ProductWebNotFoundError(validatedParams);
      }

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

  static async findProducts(
    params: Partial<ProductWebFindRequest> = {},
  ): Promise<ProductWebFindResponse> {
    try {
      const validatedParams = ProductWebServiceApi.validateSearchParams(params);

      const requestBody =
        ProductWebServiceApi.buildSearchPayload(validatedParams);

      /*
      logger.debug("Payload de busca de produtos", {
        payload: requestBody,
        timestamp: new Date().toISOString(),
      });
      */

      const instance = new ProductWebServiceApi();
      const response = await instance.post<ProductWebFindResponse>(
        PRODUCT_WEB_ENDPOINTS.FIND,
        requestBody,
      );

      return ProductWebServiceApi.handleSearchResponse(response);
    } catch (error) {
      logger.error("Erro no serviço de produto web (busca)", error);
      throw error;
    }
  }

  static async findProductWebSections(
    params: Partial<ProductWebSectionsRequest> = {},
  ): Promise<ProductWebSectionsResponse> {
    try {
      const validatedParams =
        ProductWebServiceApi.validateSectionsParams(params);

      const requestBody =
        ProductWebServiceApi.buildSectionsPayload(validatedParams);

      /*       logger.debug("Payload de busca de seções de produtos", {
        payload: requestBody,
        timestamp: new Date().toISOString(),
      }); */

      const instance = new ProductWebServiceApi();
      const response = await instance.post<ProductWebSectionsResponse>(
        PRODUCT_WEB_ENDPOINTS.SECTIONS,
        requestBody,
      );

      return ProductWebServiceApi.handleSectionsResponse(response);
    } catch (error) {
      logger.error("Erro no serviço de seções web de produtos", error);
      throw error;
    }
  }

  private static validateSearchParams(
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

  private static buildSearchPayload(
    params: Partial<ProductWebFindRequest>,
  ): Record<string, unknown> {
    return ProductWebServiceApi.buildBasePayload({
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

  private static validateSectionsParams(
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

  private static buildSectionsPayload(
    params: Partial<ProductWebSectionsRequest>,
  ): Record<string, unknown> {
    return ProductWebServiceApi.buildBasePayload({
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

  private static handleSearchResponse(
    response: ProductWebFindResponse,
  ): ProductWebFindResponse {
    if (
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT ||
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.UNPROCESSABLE
    ) {
      const defaultFeedback: [StoredProcedureResponse] = [
        {
          sp_return_id: 0,
          sp_message: "Nenhum produto encontrado",
          sp_error_id: 0,
        },
      ];

      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: [
          [],
          response.data?.[1] ?? defaultFeedback,
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

    if (isApiError(response.statusCode)) {
      throw new ProductWebError(
        response.message || "Erro ao listar produtos web",
        "PRODUCT_WEB_FIND_ERROR",
        response.statusCode,
      );
    }

    return response;
  }

  private static handleSectionsResponse(
    response: ProductWebSectionsResponse,
  ): ProductWebSectionsResponse {
    if (
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT ||
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.UNPROCESSABLE
    ) {
      const defaultFeedback: [StoredProcedureResponse] = [
        {
          sp_return_id: 0,
          sp_message: "Nenhuma seção de produto encontrada",
          sp_error_id: 0,
        },
      ];

      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: [
          [],
          response.data?.[1] ?? defaultFeedback,
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

    if (isApiError(response.statusCode)) {
      throw new ProductWebError(
        response.message || "Erro ao buscar seções web de produtos",
        "PRODUCT_WEB_SECTIONS_ERROR",
        response.statusCode,
      );
    }

    return response;
  }

  static extractProduct(
    response: ProductWebFindByIdResponse,
  ): ProductWebDetail | null {
    return response.data?.[0]?.[0] ?? null;
  }

  static extractTaxonomies(
    response: ProductWebFindByIdResponse,
  ): ProductWebRelatedTaxonomy[] {
    return response.data?.[1] ?? [];
  }

  static extractRelatedProducts(
    response: ProductWebFindByIdResponse,
  ): ProductWebRelatedItem[] {
    return response.data?.[2] ?? [];
  }

  static extractProductList(
    response: ProductWebFindResponse,
  ): ProductWebListItem[] {
    return response.data?.[0] ?? [];
  }

  static extractProductSections(
    response: ProductWebSectionsResponse,
  ): ProductWebSectionItem[] {
    return response.data?.[0] ?? [];
  }

  static isValidProductDetail(response: ProductWebFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0]) &&
      response.data[0].length > 0
    );
  }

  static isValidProductList(response: ProductWebFindResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }

  static isValidProductSections(response: ProductWebSectionsResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }
}
