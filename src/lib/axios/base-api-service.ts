import "server-only";

import type { AxiosResponse } from "axios";
import { AxiosError } from "axios";
import { API_STATUS_CODES, isApiSuccess } from "@/core/constants/api-constants";
import serverAxiosClient from "./server-axios-client";

/**
 * Custom API Error classes for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly userMessage: string = "Ocorreu um erro na comunicação com o servidor",
    public readonly statusCode?: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ApiConnectionError extends ApiError {
  constructor(message = "Não foi possível conectar à API") {
    super(message, "Erro de conexão. Verifique sua internet.");
    this.name = "ApiConnectionError";
  }
}

export class ApiValidationError extends ApiError {
  constructor(
    message = "Parâmetros inválidos",
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "Dados inválidos. Por favor, verifique os campos.");
    this.name = "ApiValidationError";
  }
}

export class ApiAuthenticationError extends ApiError {
  constructor(message = "Não autorizado") {
    super(message, "Sessão expirada ou acesso negado. Faça login novamente.");
    this.name = "ApiAuthenticationError";
  }
}

export class ApiNotFoundError extends ApiError {
  constructor(message = "Recurso não encontrado") {
    super(message, "O item solicitado não foi encontrado.");
    this.name = "ApiNotFoundError";
  }
}

export class ApiServerError extends ApiError {
  constructor(message = "Erro interno do servidor", statusCode?: number) {
    super(
      message,
      "Erro temporário no servidor. Tente novamente mais tarde.",
      statusCode,
    );
    this.name = "ApiServerError";
  }
}

/**
 * Interface para resposta padrão da API
 */
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  recordId?: number;
  quantity?: number;
  info1?: string;
}

/**
 * Classe base para todos os serviços de API
 */
export abstract class BaseApiService {
  /**
   * Executa requisição GET
   */
  protected async get<T>(
    endpoint: string,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.get(
        endpoint,
        config,
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Executa requisição POST
   */
  protected async post<T>(
    endpoint: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.post(
        endpoint,
        data,
        config,
      );

      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Executa requisição PUT
   */
  protected async put<T>(
    endpoint: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.put(
        endpoint,
        data,
        config,
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Executa requisição PATCH
   */
  protected async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.patch(
        endpoint,
        data,
        config,
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Executa requisição DELETE
   */
  protected async delete<T>(
    endpoint: string,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await serverAxiosClient.delete(
        endpoint,
        config,
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Trata resposta da API
   */
  private handleResponse<T>(response: AxiosResponse<T>): T {
    // O tratamento de status codes customizados (100XXX) é de responsabilidade do serviço específico.
    // O BaseApiService trata apenas erros de nível HTTP (4xx, 5xx) no método handleError.
    return response.data;
  }

  /**
   * Trata erros das requisições
   */
  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      // Erro de resposta HTTP
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // Se a resposta tem estrutura da API
        if (data && typeof data === "object" && "message" in data) {
          // Retorna erro específico baseado no status
          switch (status) {
            case 400:
              return new ApiValidationError(
                data.message || "Requisição inválida",
              );
            case 401:
            case 403:
              return new ApiAuthenticationError(
                data.message || "Não autorizado",
              );
            case 404:
              return new ApiNotFoundError(
                data.message || "Recurso não encontrado",
              );
            case 500:
            case 502:
            case 503:
            case 504:
              return new ApiServerError(
                data.message || "Erro interno do servidor",
                status,
              );
            default:
              return new Error(data.message || "Erro na API");
          }
        }

        // Mensagens padrão por código de status (sem estrutura da API)
        switch (status) {
          case 400:
            return new ApiValidationError("Requisição inválida");
          case 401:
          case 403:
            return new ApiAuthenticationError("Não autorizado");
          case 404:
            return new ApiNotFoundError("Recurso não encontrado");
          case 500:
          case 502:
          case 503:
          case 504:
            return new ApiServerError("Erro interno do servidor", status);
          default:
            return new Error(`Erro HTTP ${status}`);
        }
      }

      // Erro de requisição (sem resposta)
      if (error.request) {
        return new ApiConnectionError("Erro de conexão com a API");
      }

      // Erro de configuração
      return new Error("Erro na configuração da requisição");
    }

    // Erro genérico
    if (error instanceof Error) {
      return error;
    }

    return new Error("Erro desconhecido");
  }

  /**
   * Monta payload padrão para requisições
   */
  protected buildPayload(
    data: Record<string, unknown>,
    additionalFields?: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      ...data,
      ...additionalFields,
    };
  }

  /**
   * Valida se uma resposta da API é válida
   */
  protected isValidApiResponse<T>(response: ApiResponse<T>): boolean {
    return isApiSuccess(response.statusCode);
  }

  /**
   * Extrai dados da resposta da API
   */
  protected extractData<T>(response: ApiResponse<T>): T | null {
    return response.data || null;
  }

  /**
   * Extrai mensagem da resposta da API
   */
  protected extractMessage<T>(response: ApiResponse<T>): string {
    return response.message || "";
  }

  /**
   * Normaliza uma resposta vazia ou não encontrada para um formato padrão de sucesso sem dados.
   * Útil para evitar lançar erros em buscas que simplesmente não retornaram resultados.
   */
  protected normalizeEmptyResponse<T extends ApiResponse>(
    response: T,
    emptyMessage = "Nenhum resultado encontrado",
  ): T {
    if (
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT ||
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.UNPROCESSABLE
    ) {
      // Retorna uma estrutura de sucesso mas com dados vazios
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: [
          [],
          [{ sp_return_id: 0, sp_message: emptyMessage, sp_error_id: 0 }],
        ],
      } as unknown as T;
    }

    return response;
  }
}
