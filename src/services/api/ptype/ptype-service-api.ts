/**
 * Serviço de tipos de produto para interagir com a API
 */

import { envs } from "@/core/config";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  PTYPE_ENDPOINTS,
} from "@/lib/constants/api-constants";
import { createLogger } from "@/lib/logger";

import type {
  FindPtypeRequest,
  FindPtypeResponse,
  PtypeData,
  StoredProcedureResponse,
} from "./types/ptype-types";

import { FindPtypeSchema } from "./validation/ptype-schemas";

// Logger instance
const logger = createLogger("PtypeService");

/**
 * Serviço para operações relacionadas a tipos de produto
 */
export class PtypeServiceApi extends BaseApiService {
  /**
   * Build base payload with environment variables
   */
  private static buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_system_client_id: 1,
      pe_store_id: 1,
      pe_organization_id: "xxx",
      pe_member_id: "xxx",
      pe_user_id: "",
      pe_person_id: "1937", // Valor dinâmico das variáveis de ambiente
      ...additionalData,
    };
  }

  /**
   * Endpoint - Listar Tipos de Produto v2
   * @param params - Parâmetros de busca e filtros
   * @returns Promise com lista de tipos de produto
   */
  static async findPtypes(
    params: Partial<FindPtypeRequest> = {},
  ): Promise<FindPtypeResponse> {
    try {
      const validatedParams = PtypeServiceApi.validateSearchParams(params);
      const requestBody = PtypeServiceApi.buildSearchPayload(validatedParams);

      const response = await PtypeServiceApi.executePtypeSearch(requestBody);

      return PtypeServiceApi.handleSearchResponse(response);
    } catch (error) {
      logger.error("Erro no serviço de tipos de produto (busca)", error);
      throw error;
    }
  }

  /**
   * Valida parâmetros de busca
   * @private
   */
  private static validateSearchParams(
    params: Partial<FindPtypeRequest>,
  ): Partial<FindPtypeRequest> {
    try {
      return FindPtypeSchema.partial().parse(params);
    } catch (error) {
      logger.error("Erro na validação de parâmetros de busca", error);
      throw error;
    }
  }

  /**
   * Constrói payload de busca com valores padrão
   * @private
   */
  private static buildSearchPayload(
    params: Partial<FindPtypeRequest>,
  ): Record<string, unknown> {
    const payload = PtypeServiceApi.buildBasePayload({
      pe_id_tipo: 0, // Valor padrão - sem filtro específico
      pe_tipo: "", // Valor padrão - sem filtro por nome
      pe_limit: 100, // Valor padrão - 100 registros
      ...params,
    });

    return payload;
  }

  /**
   * Executa busca de tipos de produto na API
   * @private
   */
  private static async executePtypeSearch(
    requestBody: Record<string, unknown>,
  ): Promise<FindPtypeResponse> {
    const instance = new PtypeServiceApi();
    return await instance.post<FindPtypeResponse>(
      PTYPE_ENDPOINTS.FIND_ALL,
      requestBody,
    );
  }

  /**
   * Trata resposta da busca de tipos de produto
   * @private
   */
  private static handleSearchResponse(
    data: FindPtypeResponse,
  ): FindPtypeResponse {
    // Verifica se é código de resultado vazio ou não encontrado
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
          [
            {
              sp_return_id: 0,
              sp_message: "Nenhum tipo de produto encontrado",
              sp_error_id: 0,
            },
          ],
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

    // Verifica se a busca foi bem-sucedida usando função utilitária
    if (isApiError(data.statusCode)) {
      throw new Error(data.message || "Erro ao buscar tipos de produto");
    }

    return data;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Extrai lista de tipos de produto da resposta da API
   * @param response - Resposta da API
   * @returns Lista de tipos de produto ou array vazio
   */
  static extractPtypeList(response: FindPtypeResponse): PtypeData[] {
    return response.data?.[0] ?? [];
  }

  /**
   * Extrai resposta da stored procedure
   * @param response - Resposta da API com stored procedure
   * @returns Resposta da stored procedure ou null
   */
  static extractStoredProcedureResponse(
    response: FindPtypeResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[1]?.[0] ?? null;
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  /**
   * Valida se a resposta de busca de tipos de produto é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidPtypeResponse(response: FindPtypeResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }

  /**
   * Verifica se a operação foi bem-sucedida baseado na stored procedure
   * @param response - Resposta da API
   * @returns true se bem-sucedida, false caso contrário
   */
  static isOperationSuccessful(response: FindPtypeResponse): boolean {
    const spResponse = PtypeServiceApi.extractStoredProcedureResponse(response);
    return spResponse ? spResponse.sp_error_id === 0 : false;
  }
}
