/**
 * Serviço de verificação (Check API) para validar existência de dados
 * Baseado na documentação da API Check Reference
 */

import { envs } from "@/core/config";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  CHECK_ENDPOINTS,
  isApiError,
  isApiSuccess,
} from "@/lib/constants/api-constants";
import { createLogger } from "@/lib/logger";

import type {
  ApiStatusResponse,
  CheckCnpjRequest,
  CheckCnpjResponse,
  CheckCpfRequest,
  CheckCpfResponse,
  CheckEmailRequest,
  CheckEmailResponse,
  CheckProductNameRequest,
  CheckProductNameResponse,
  CheckProductSlugRequest,
  CheckProductSlugResponse,
  CheckRecordsType,
  CheckResult,
  CheckTaxonomySlugRequest,
  CheckTaxonomySlugResponse,
} from "./types/check-types";

import {
  CHECK_ERROR_MESSAGES,
  CHECK_SUCCESS_MESSAGES,
  CHECK_TYPE_CONFIGS,
  CheckType,
} from "./types/check-types";

import {
  CheckCnpjSchema,
  CheckCpfSchema,
  CheckEmailSchema,
  CheckProductNameSchema,
  CheckProductSlugSchema,
  CheckTaxonomySlugSchema,
} from "./validation/check-schemas";

// Logger instance
const logger = createLogger("CheckService");

/**
 * Serviço para operações de verificação de dados existentes
 */
export class CheckServiceApi extends BaseApiService {
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
      pe_organization_id: 'xxx',
      pe_member_id: 'xxx',
      pe_user_id: '',
      pe_person_id: '1937', // Valor dinâmico das variáveis de ambiente
      ...additionalData,
    };
  }

  /**
   * Health Check - Verifica status da API
   * @returns Promise com status da API
   */
  static async getApiStatus(): Promise<ApiStatusResponse> {
    try {
      const instance = new CheckServiceApi();

      // Usa GET request sem autenticação para o health check
      const data = await instance.get<ApiStatusResponse>(
        CHECK_ENDPOINTS.STATUS,
      );

      return data;
    } catch (error) {
      logger.error("Erro no health check da API", error);
      throw new Error("API Check service is offline");
    }
  }

  /**
   * Verifica se um email já existe no sistema
   * @param params - Parâmetros de verificação do email
   * @returns Promise com resultado da verificação
   */
  static async checkEmailExists(
    params: Partial<CheckEmailRequest> & { pe_term: string },
  ): Promise<CheckEmailResponse> {
    try {
      const validatedParams = CheckEmailSchema.parse({
        ...CheckServiceApi.buildBasePayload(),
        ...params,
      });

      const instance = new CheckServiceApi();
      const data = await instance.post<CheckEmailResponse>(
        CHECK_ENDPOINTS.EMAIL,
        validatedParams,
      );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao verificar email");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao verificar email", error);
      throw error;
    }
  }

  /**
   * Verifica se um CPF já existe no sistema
   * @param params - Parâmetros de verificação do CPF
   * @returns Promise com resultado da verificação
   */
  static async checkCpfExists(
    params: Partial<CheckCpfRequest> & { pe_term: string },
  ): Promise<CheckCpfResponse> {
    try {
      const validatedParams = CheckCpfSchema.parse({
        ...CheckServiceApi.buildBasePayload(),
        ...params,
      });

      const instance = new CheckServiceApi();
      const data = await instance.post<CheckCpfResponse>(
        CHECK_ENDPOINTS.CPF,
        validatedParams,
      );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao verificar CPF");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao verificar CPF", error);
      throw error;
    }
  }

  /**
   * Verifica se um CNPJ já existe no sistema
   * @param params - Parâmetros de verificação do CNPJ
   * @returns Promise com resultado da verificação
   */
  static async checkCnpjExists(
    params: Partial<CheckCnpjRequest> & { pe_term: string },
  ): Promise<CheckCnpjResponse> {
    try {
      const validatedParams = CheckCnpjSchema.parse({
        ...CheckServiceApi.buildBasePayload(),
        ...params,
      });

      const instance = new CheckServiceApi();
      const data = await instance.post<CheckCnpjResponse>(
        CHECK_ENDPOINTS.CNPJ,
        validatedParams,
      );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao verificar CNPJ");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao verificar CNPJ", error);
      throw error;
    }
  }

  /**
   * Verifica se um slug de taxonomia já existe no sistema
   * @param params - Parâmetros de verificação do slug
   * @returns Promise com resultado da verificação
   */
  static async checkTaxonomySlugExists(
    params: Partial<CheckTaxonomySlugRequest> & { pe_term: string },
  ): Promise<CheckTaxonomySlugResponse> {
    try {
      const validatedParams = CheckTaxonomySlugSchema.parse({
        ...CheckServiceApi.buildBasePayload(),
        ...params,
      });

      const instance = new CheckServiceApi();
      const data = await instance.post<CheckTaxonomySlugResponse>(
        CHECK_ENDPOINTS.TAXONOMY_SLUG,
        validatedParams,
      );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao verificar slug de taxonomia");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao verificar slug de taxonomia", error);
      throw error;
    }
  }

  /**
   * Verifica se um nome de produto já existe no sistema
   * @param params - Parâmetros de verificação do nome
   * @returns Promise com resultado da verificação
   */
  static async checkProductNameExists(
    params: Partial<CheckProductNameRequest> & { pe_term: string },
  ): Promise<CheckProductNameResponse> {
    try {
      const validatedParams = CheckProductNameSchema.parse({
        ...CheckServiceApi.buildBasePayload(),
        ...params,
      });

      const instance = new CheckServiceApi();
      const data = await instance.post<CheckProductNameResponse>(
        CHECK_ENDPOINTS.PRODUCT_NAME,
        validatedParams,
      );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao verificar nome do produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao verificar nome do produto", error);
      throw error;
    }
  }

  /**
   * Verifica se um slug de produto já existe no sistema
   * @param params - Parâmetros de verificação do slug
   * @returns Promise com resultado da verificação
   */
  static async checkProductSlugExists(
    params: Partial<CheckProductSlugRequest> & { pe_term: string },
  ): Promise<CheckProductSlugResponse> {
    try {
      const validatedParams = CheckProductSlugSchema.parse({
        ...CheckServiceApi.buildBasePayload(),
        ...params,
      });

      const instance = new CheckServiceApi();
      const data = await instance.post<CheckProductSlugResponse>(
        CHECK_ENDPOINTS.PRODUCT_SLUG,
        validatedParams,
      );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao verificar slug do produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro ao verificar slug do produto", error);
      throw error;
    }
  }

  // ========================================
  // CONVENIENCE METHODS (Simplified API)
  // ========================================

  /**
   * Método simplificado para verificar email
   * @param email - Email a ser verificado
   * @returns Promise com resultado simplificado
   */
  static async checkEmail(email: string): Promise<CheckResult> {
    const response = await CheckServiceApi.checkEmailExists({ pe_term: email });
    return CheckServiceApi.processCheckResult(response, CheckType.EMAIL);
  }

  /**
   * Método simplificado para verificar CPF
   * @param cpf - CPF a ser verificado (com ou sem formatação)
   * @returns Promise com resultado simplificado
   */
  static async checkCpf(cpf: string): Promise<CheckResult> {
    const response = await CheckServiceApi.checkCpfExists({ pe_term: cpf });
    return CheckServiceApi.processCheckResult(response, CheckType.CPF);
  }

  /**
   * Método simplificado para verificar CNPJ
   * @param cnpj - CNPJ a ser verificado (com ou sem formatação)
   * @returns Promise com resultado simplificado
   */
  static async checkCnpj(cnpj: string): Promise<CheckResult> {
    const response = await CheckServiceApi.checkCnpjExists({ pe_term: cnpj });
    return CheckServiceApi.processCheckResult(response, CheckType.CNPJ);
  }

  /**
   * Método simplificado para verificar slug de taxonomia
   * @param slug - Slug a ser verificado
   * @returns Promise com resultado simplificado
   */
  static async checkTaxonomySlug(slug: string): Promise<CheckResult> {
    const response = await CheckServiceApi.checkTaxonomySlugExists({
      pe_term: slug,
    });
    return CheckServiceApi.processCheckResult(
      response,
      CheckType.TAXONOMY_SLUG,
    );
  }

  /**
   * Método simplificado para verificar nome de produto
   * @param name - Nome a ser verificado
   * @returns Promise com resultado simplificado
   */
  static async checkProductName(name: string): Promise<CheckResult> {
    const response = await CheckServiceApi.checkProductNameExists({
      pe_term: name,
    });
    return CheckServiceApi.processCheckResult(response, CheckType.PRODUCT_NAME);
  }

  /**
   * Método simplificado para verificar slug de produto
   * @param slug - Slug a ser verificado
   * @returns Promise com resultado simplificado
   */
  static async checkProductSlug(slug: string): Promise<CheckResult> {
    const response = await CheckServiceApi.checkProductSlugExists({
      pe_term: slug,
    });
    return CheckServiceApi.processCheckResult(response, CheckType.PRODUCT_SLUG);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Processa resposta da API e retorna resultado simplificado
   * @private
   */
  private static processCheckResult(
    response:
      | CheckEmailResponse
      | CheckCpfResponse
      | CheckCnpjResponse
      | CheckTaxonomySlugResponse
      | CheckProductNameResponse
      | CheckProductSlugResponse,
    type: CheckType,
  ): CheckResult {
    const isAvailable = response.quantity === 0;

    return {
      isAvailable,
      recordId: response.recordId,
      message: isAvailable
        ? CHECK_SUCCESS_MESSAGES[type]
        : CHECK_ERROR_MESSAGES[type],
      existingData: response.data,
    };
  }

  /**
   * Verifica se um termo é válido para determinado tipo de verificação
   * @param term - Termo a ser validado
   * @param type - Tipo de verificação
   * @returns true se válido, false caso contrário
   */
  static isValidTerm(term: string, type: CheckType): boolean {
    const config = CHECK_TYPE_CONFIGS[type];

    // Verifica comprimento mínimo
    if (term.trim().length < config.minLength) {
      return false;
    }

    // Normaliza input se necessário
    const normalizedTerm = config.normalizeInput
      ? config.normalizeInput(term)
      : term;

    // Verifica padrão de validação se definido
    if (
      config.validationPattern &&
      !config.validationPattern.test(normalizedTerm)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Normaliza termo para determinado tipo de verificação
   * @param term - Termo a ser normalizado
   * @param type - Tipo de verificação
   * @returns Termo normalizado
   */
  static normalizeTerm(term: string, type: CheckType): string {
    const config = CHECK_TYPE_CONFIGS[type];
    return config.normalizeInput ? config.normalizeInput(term) : term;
  }

  /**
   * Extrai dados da verificação da resposta da API
   * @param response - Resposta da API
   * @returns Dados da verificação ou null
   */
  static extractCheckData(
    response:
      | CheckEmailResponse
      | CheckCpfResponse
      | CheckCnpjResponse
      | CheckTaxonomySlugResponse
      | CheckProductNameResponse
      | CheckProductSlugResponse,
  ): CheckRecordsType | null {
    return response.data || null;
  }

  /**
   * Verifica se o termo está disponível (não existe)
   * @param response - Resposta da API
   * @returns true se disponível, false se já existe
   */
  static isTermAvailable(
    response:
      | CheckEmailResponse
      | CheckCpfResponse
      | CheckCnpjResponse
      | CheckTaxonomySlugResponse
      | CheckProductNameResponse
      | CheckProductSlugResponse,
  ): boolean {
    return response.quantity === 0;
  }

  /**
   * Verifica se o termo já existe
   * @param response - Resposta da API
   * @returns true se existe, false se disponível
   */
  static isTermExists(
    response:
      | CheckEmailResponse
      | CheckCpfResponse
      | CheckCnpjResponse
      | CheckTaxonomySlugResponse
      | CheckProductNameResponse
      | CheckProductSlugResponse,
  ): boolean {
    return response.quantity > 0;
  }

  /**
   * Obtém ID do registro existente (se houver)
   * @param response - Resposta da API
   * @returns ID do registro ou 0 se não existe
   */
  static getExistingRecordId(
    response:
      | CheckEmailResponse
      | CheckCpfResponse
      | CheckCnpjResponse
      | CheckTaxonomySlugResponse
      | CheckProductNameResponse
      | CheckProductSlugResponse,
  ): number {
    return response.recordId;
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  /**
   * Valida se a resposta da verificação é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidCheckResponse(
    response:
      | CheckEmailResponse
      | CheckCpfResponse
      | CheckCnpjResponse
      | CheckTaxonomySlugResponse
      | CheckProductNameResponse
      | CheckProductSlugResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data !== undefined &&
      typeof response.quantity === "number" &&
      typeof response.recordId === "number"
    );
  }

  /**
   * Valida se a resposta do status da API é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidApiStatusResponse(response: ApiStatusResponse): boolean {
    return (
      typeof response.name === "string" &&
      typeof response.status === "string" &&
      typeof response.version === "string" &&
      response.endpoints &&
      typeof response.endpoints.base === "string"
    );
  }

  // ========================================
  // BATCH VALIDATION METHODS
  // ========================================

  /**
   * Verifica múltiplos termos em lote
   * @param checks - Array de verificações a serem feitas
   * @returns Promise com resultados das verificações
   */
  static async checkMultiple(
    checks: Array<{ type: CheckType; term: string }>,
  ): Promise<CheckResult[]> {
    const promises = checks.map(async ({ type, term }) => {
      switch (type) {
        case CheckType.EMAIL:
          return CheckServiceApi.checkEmail(term);
        case CheckType.CPF:
          return CheckServiceApi.checkCpf(term);
        case CheckType.CNPJ:
          return CheckServiceApi.checkCnpj(term);
        case CheckType.TAXONOMY_SLUG:
          return CheckServiceApi.checkTaxonomySlug(term);
        case CheckType.PRODUCT_NAME:
          return CheckServiceApi.checkProductName(term);
        case CheckType.PRODUCT_SLUG:
          return CheckServiceApi.checkProductSlug(term);
        default:
          throw new Error(`Unsupported check type: ${type}`);
      }
    });

    return Promise.all(promises);
  }

  /**
   * Verifica se todos os termos estão disponíveis
   * @param checks - Array de verificações a serem feitas
   * @returns Promise com resultado consolidado
   */
  static async areAllAvailable(
    checks: Array<{ type: CheckType; term: string }>,
  ): Promise<{ allAvailable: boolean; results: CheckResult[] }> {
    const results = await CheckServiceApi.checkMultiple(checks);
    const allAvailable = results.every((result) => result.isAvailable);

    return { allAvailable, results };
  }
}
