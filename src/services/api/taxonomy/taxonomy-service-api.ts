/**
 * Serviço de taxonomias para interagir com a API
 */

import { envs } from "@/core/config";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  TAXONOMY_ENDPOINTS,
} from "@/lib/constants/api-constants";
import { createLogger } from "@/lib/logger";

import type {
  CreateTaxonomyRelRequest,
  CreateTaxonomyRelResponse,
  CreateTaxonomyRequest,
  CreateTaxonomyResponse,
  DeleteTaxonomyRelRequest,
  DeleteTaxonomyRelResponse,
  DeleteTaxonomyRequest,
  DeleteTaxonomyResponse,
  FindTaxonomyByIdRequest,
  FindTaxonomyByIdResponse,
  FindTaxonomyMenuRequest,
  FindTaxonomyMenuResponse,
  FindTaxonomyRelProdutoRequest,
  FindTaxonomyRelProdutoResponse,
  FindTaxonomyRequest,
  FindTaxonomyResponse,
  StoredProcedureResponse,
  TaxonomyData,
  TaxonomyProductData,
  UpdateTaxonomyInactiveRequest,
  UpdateTaxonomyInactiveResponse,
  UpdateTaxonomyMetadataRequest,
  UpdateTaxonomyMetadataResponse,
  UpdateTaxonomyNameRequest,
  UpdateTaxonomyNameResponse,
  UpdateTaxonomyOrdemRequest,
  UpdateTaxonomyOrdemResponse,
  UpdateTaxonomyParentIdRequest,
  UpdateTaxonomyParentIdResponse,
  UpdateTaxonomyPathImageRequest,
  UpdateTaxonomyPathImageResponse,
  UpdateTaxonomyRequest,
  UpdateTaxonomyResponse,
} from "./types/taxonomy-types";

import {
  CreateTaxonomyRelSchema,
  CreateTaxonomySchema,
  DeleteTaxonomyRelSchema,
  DeleteTaxonomySchema,
  FindTaxonomyByIdSchema,
  FindTaxonomyMenuSchema,
  FindTaxonomyRelProdutoSchema,
  FindTaxonomySchema,
  UpdateTaxonomyInactiveSchema,
  UpdateTaxonomyMetadataSchema,
  UpdateTaxonomyNameSchema,
  UpdateTaxonomyOrdemSchema,
  UpdateTaxonomyParentIdSchema,
  UpdateTaxonomyPathImageSchema,
  UpdateTaxonomySchema,
} from "./validation/taxonomy-schemas";

// Logger instance
const logger = createLogger("TaxonomyService");

/**
 * Serviço para operações relacionadas a taxonomias
 */
export class TaxonomyServiceApi extends BaseApiService {
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
   * Endpoint 01 - Busca taxonomias para menu
   * Retorna a estrutura hierárquica completa de taxonomias (categorias) organizadas em formato de menu.
   *
   * Características:
   * - Retorna estrutura aninhada com propriedade `children` em cada nó
   * - Suporta múltiplos níveis de profundidade (tipicamente 3 níveis)
   * - Filtro obrigatório por tipo de taxonomia (pe_id_tipo)
   * - Filtro opcional por taxonomia pai (pe_parent_id)
   * - Respeita ordenação definida no campo ORDEM
   *
   * @param params - Parâmetros de busca para menu
   * @param params.pe_id_tipo - ID do tipo de taxonomia (obrigatório)
   * @param params.pe_parent_id - ID da taxonomia pai para filtrar hierarquicamente (opcional)
   * @returns Promise com estrutura hierárquica de taxonomias
   * @throws {TaxonomyError} Quando há erro na requisição ou validação
   */
  static async findTaxonomyMenu(
    params: Partial<FindTaxonomyMenuRequest> & { pe_id_tipo: number },
  ): Promise<FindTaxonomyMenuResponse> {
    try {
      // Validar parâmetros - pe_id_tipo é obrigatório
      const validatedParams = FindTaxonomyMenuSchema.parse({
        pe_id_tipo: params.pe_id_tipo,
        pe_parent_id: params.pe_parent_id,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload({
        pe_id_tipo: validatedParams.pe_id_tipo,
        pe_parent_id: validatedParams.pe_parent_id ?? 0, // Default: busca da raiz
      });

      const data: FindTaxonomyMenuResponse =
        await instance.post<FindTaxonomyMenuResponse>(
          TAXONOMY_ENDPOINTS.FIND_MENU,
          requestBody,
        );

      // Verifica se a busca foi bem-sucedida usando função utilitária
      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao buscar taxonomias para menu");
      }

      return data;
    } catch (error) {
      logger.error("Erro no serviço de taxonomias (menu)", error);
      throw error;
    }
  }

  /**
   * Endpoint 02 - Lista taxonomias com paginação e filtros
   * @param params - Parâmetros de busca e paginação
   * @returns Promise com lista de taxonomias
   */
  static async findTaxonomies(
    params: Partial<FindTaxonomyRequest> = {},
  ): Promise<FindTaxonomyResponse> {
    try {
      const validatedParams = TaxonomyServiceApi.validateSearchParams(params);
      const requestBody =
        TaxonomyServiceApi.buildSearchPayload(validatedParams);

      const response =
        await TaxonomyServiceApi.executeTaxonomySearch(requestBody);

      return TaxonomyServiceApi.handleSearchResponse(response);
    } catch (error) {
      logger.error("Erro no serviço de taxonomias (busca)", error);
      throw error;
    }
  }

  /**
   * Valida parâmetros de busca
   * @private
   */
  private static validateSearchParams(
    params: Partial<FindTaxonomyRequest>,
  ): Partial<FindTaxonomyRequest> {
    try {
      return FindTaxonomySchema.partial().parse(params);
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
    params: Partial<FindTaxonomyRequest>,
  ): Record<string, unknown> {
    const payload = TaxonomyServiceApi.buildBasePayload({
      pe_id_parent: -1, // Valor padrão - busca todos níveis
      pe_id_taxonomy: 0, // Valor padrão - sem filtro específico
      pe_taxonomia: "", // Valor padrão - sem filtro por nome
      pe_flag_inativo: 0, // Valor padrão - apenas ativos
      pe_qt_registros: 20, // Valor padrão - 20 registros por página
      pe_pagina_id: 0, // Valor padrão - primeira página (MySQL começa em 0)
      pe_coluna_id: 2, // Valor padrão - ordenação por nome
      pe_ordem_id: 1, // Valor padrão - ordem crescente
      ...params,
    });

    return payload;
  }

  /**
   * Executa busca de taxonomias na API
   * @private
   */
  private static async executeTaxonomySearch(
    requestBody: Record<string, unknown>,
  ): Promise<FindTaxonomyResponse> {
    const instance = new TaxonomyServiceApi();
    return await instance.post<FindTaxonomyResponse>(
      TAXONOMY_ENDPOINTS.FIND,
      requestBody,
    );
  }

  /**
   * Trata resposta da busca de taxonomias
   * @private
   */
  private static handleSearchResponse(
    data: FindTaxonomyResponse,
  ): FindTaxonomyResponse {
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
      throw new Error(data.message || "Erro ao buscar taxonomias");
    }

    return data;
  }

  /**
   * Endpoint 03 - Busca taxonomy por ID ou slug
   * @param params - Parâmetros com ID ou slug da taxonomy (pelo menos um obrigatório)
   * @returns Promise com dados da taxonomy
   * @throws Error se nenhum critério de busca for fornecido ou se a taxonomy não for encontrada
   */
  static async findTaxonomyById(
    params: Partial<FindTaxonomyByIdRequest> &
      ({ pe_id_taxonomy: number } | { pe_slug_taxonomy: string }),
  ): Promise<FindTaxonomyByIdResponse> {
    try {
      // Validar parâmetros - schema verifica se pelo menos um está presente
      const validatedParams = FindTaxonomyByIdSchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_slug_taxonomy: params.pe_slug_taxonomy,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload({
        pe_id_taxonomy: validatedParams.pe_id_taxonomy ?? 0, // 0 quando busca por slug
        pe_slug_taxonomy: validatedParams.pe_slug_taxonomy ?? "", // "" quando busca por ID
      });

      const data: FindTaxonomyByIdResponse =
        await instance.post<FindTaxonomyByIdResponse>(
          TAXONOMY_ENDPOINTS.FIND_BY_ID,
          requestBody,
        );

      // Verifica se a busca foi bem-sucedida usando função utilitária
      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao buscar taxonomy por ID ou slug",
        );
      }

      // Verifica se a taxonomy foi encontrada
      if (!data.data || !data.data[0] || !data.data[0][0]) {
        throw new Error("Taxonomy não encontrada com os critérios fornecidos");
      }

      return data;
    } catch (error) {
      logger.error("Erro no serviço de taxonomy por ID/slug", error);
      throw error;
    }
  }

  /**
   * Endpoint 04 - Adiciona nova taxonomy
   * @param params - Parâmetros da nova taxonomy
   * @returns Promise com resposta da criação
   */
  static async createTaxonomy(
    params: Partial<CreateTaxonomyRequest> & {
      pe_taxonomia: string;
      pe_slug: string;
    },
  ): Promise<CreateTaxonomyResponse> {
    try {
      // Validar parâmetros
      const validatedParams = CreateTaxonomySchema.parse({
        pe_id_tipo: params.pe_id_tipo ?? 1,
        pe_parent_id: params.pe_parent_id ?? 0,
        pe_taxonomia: params.pe_taxonomia,
        pe_slug: params.pe_slug,
        pe_level: params.pe_level ?? 1,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload(validatedParams);

      const data: CreateTaxonomyResponse =
        await instance.post<CreateTaxonomyResponse>(
          TAXONOMY_ENDPOINTS.CREATE,
          requestBody,
        );

      // Verifica se a criação foi bem-sucedida usando função utilitária
      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao criar taxonomy");
      }

      return data;
    } catch (error) {
      logger.error("Erro no serviço de criação de taxonomy", error);
      throw error;
    }
  }

  /**
   * Endpoint 05 - Atualiza taxonomy existente
   * @param params - Parâmetros de atualização da taxonomy
   * @returns Promise com resposta da atualização
   */
  static async updateTaxonomy(
    params: Partial<UpdateTaxonomyRequest> & {
      pe_id_taxonomy: number;
      pe_taxonomia: string;
    },
  ): Promise<UpdateTaxonomyResponse> {
    try {
      // Validar parâmetros
      const validatedParams = UpdateTaxonomySchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_taxonomia: params.pe_taxonomia,
        pe_parent_id: params.pe_parent_id,
        pe_slug: params.pe_slug,
        pe_path_imagem: params.pe_path_imagem,
        pe_ordem: params.pe_ordem,
        pe_meta_title: params.pe_meta_title,
        pe_meta_description: params.pe_meta_description,
        pe_inativo: params.pe_inativo,
        pe_info: params.pe_info,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload({
        pe_parent_id: 0, // Valor padrão - raiz
        pe_slug: "", // Valor padrão - slug vazio
        pe_path_imagem: "", // Valor padrão - sem imagem
        pe_ordem: 1, // Valor padrão - primeira posição
        pe_meta_title: "", // Valor padrão - sem meta title
        pe_meta_description: "", // Valor padrão - sem meta description
        pe_inativo: 0, // Valor padrão - ativo
        pe_info: "", // Valor padrão - sem informações extras
        ...validatedParams,
      });

      const data: UpdateTaxonomyResponse =
        await instance.post<UpdateTaxonomyResponse>(
          TAXONOMY_ENDPOINTS.UPDATE,
          requestBody,
        );

      // Verifica se a atualização foi bem-sucedida usando função utilitária
      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar taxonomy");
      }

      return data;
    } catch (error) {
      logger.error("Erro no serviço de atualização de taxonomy", error);
      throw error;
    }
  }

  /**
   * Endpoint 06 - Exclui taxonomy
   * @param params - Parâmetros com ID da taxonomy a ser excluída
   * @returns Promise com resposta da exclusão
   */
  static async deleteTaxonomy(
    params: Partial<DeleteTaxonomyRequest> & { pe_id_taxonomy: number },
  ): Promise<DeleteTaxonomyResponse> {
    try {
      // Validar parâmetros
      const validatedParams = DeleteTaxonomySchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const data: DeleteTaxonomyResponse =
        await instance.post<DeleteTaxonomyResponse>(
          TAXONOMY_ENDPOINTS.DELETE,
          requestBody,
        );

      // Verifica se a exclusão foi bem-sucedida usando função utilitária
      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao excluir taxonomy");
      }

      return data;
    } catch (error) {
      logger.error("Erro no serviço de exclusão de taxonomy", error);
      throw error;
    }
  }

  /**
   * Endpoint 07 - Cria relacionamento entre taxonomia e produto
   * @param params - Parâmetros com IDs de taxonomia e produto
   * @returns Promise com resposta da criação do relacionamento
   */
  static async createTaxonomyRel(
    params: Partial<CreateTaxonomyRelRequest> & {
      pe_id_taxonomy: number;
      pe_id_record: number;
    },
  ): Promise<CreateTaxonomyRelResponse> {
    try {
      // Validar parâmetros
      const validatedParams = CreateTaxonomyRelSchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_id_record: params.pe_id_record,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload(validatedParams);

      const data: CreateTaxonomyRelResponse =
        await instance.post<CreateTaxonomyRelResponse>(
          TAXONOMY_ENDPOINTS.REL_CREATE,
          requestBody,
        );

      // Verifica se a criação foi bem-sucedida usando função utilitária
      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao criar relacionamento taxonomy-produto",
        );
      }

      return data;
    } catch (error) {
      logger.error(
        "Erro no serviço de criação de relacionamento taxonomy-produto",
        error,
      );
      throw error;
    }
  }

  /**
   * Endpoint 08 - Lista taxonomias (categorias) relacionadas a um produto
   * Retorna a hierarquia completa de categorias associadas ao produto (até 3 níveis)
   * @param params - Parâmetros com ID do produto
   * @returns Promise com lista hierárquica de taxonomias do produto
   */
  static async findTaxonomyRelProduto(
    params: Partial<FindTaxonomyRelProdutoRequest> & {
      pe_id_record: number;
    },
  ): Promise<FindTaxonomyRelProdutoResponse> {
    try {
      // Validar parâmetros
      const validatedParams = FindTaxonomyRelProdutoSchema.parse({
        pe_id_record: params.pe_id_record,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const data: FindTaxonomyRelProdutoResponse =
        await instance.post<FindTaxonomyRelProdutoResponse>(
          TAXONOMY_ENDPOINTS.REL_PRODUTO,
          requestBody,
        );

      // Verifica se a busca foi bem-sucedida usando função utilitária
      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao buscar taxonomias do produto");
      }

      return data;
    } catch (error) {
      logger.error("Erro no serviço de busca de taxonomias do produto", error);
      throw error;
    }
  }

  /**
   * Endpoint 09 - Deleta relacionamento entre taxonomia e produto
   * @param params - Parâmetros com IDs de taxonomia e produto (pe_id_record)
   * @returns Promise com resposta da exclusão do relacionamento
   */
  static async deleteTaxonomyRel(
    params: Partial<DeleteTaxonomyRelRequest> & {
      pe_id_taxonomy: number;
      pe_id_record: number;
    },
  ): Promise<DeleteTaxonomyRelResponse> {
    try {
      // Validar parâmetros
      const validatedParams = DeleteTaxonomyRelSchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_id_record: params.pe_id_record,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload(validatedParams);

      const data: DeleteTaxonomyRelResponse =
        await instance.post<DeleteTaxonomyRelResponse>(
          TAXONOMY_ENDPOINTS.REL_DELETE,
          requestBody,
        );

      // Verifica se a exclusão foi bem-sucedida usando função utilitária
      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao deletar relacionamento taxonomy-produto",
        );
      }

      return data;
    } catch (error) {
      logger.error(
        "Erro no serviço de exclusão de relacionamento taxonomy-produto",
        error,
      );
      throw error;
    }
  }

  /**
   * Endpoint 10 - Atualiza status de inativação (ativo/inativo) de taxonomy
   * @param params - Parâmetros com ID da taxonomy e flag de inativação
   * @returns Promise com resposta da atualização
   */
  static async updateTaxonomyInactive(
    params: Partial<UpdateTaxonomyInactiveRequest> & {
      pe_id_taxonomy: number;
      pe_inactive: boolean;
    },
  ): Promise<UpdateTaxonomyInactiveResponse> {
    try {
      // Validar parâmetros
      const validatedParams = UpdateTaxonomyInactiveSchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_inactive: params.pe_inactive,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload(validatedParams);

      const data: UpdateTaxonomyInactiveResponse =
        await instance.post<UpdateTaxonomyInactiveResponse>(
          TAXONOMY_ENDPOINTS.UPDATE_INACTIVE,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar status de inativação da taxonomy",
        );
      }

      return data;
    } catch (error) {
      logger.error(
        "Erro no serviço de atualização de status de taxonomy",
        error,
      );
      throw error;
    }
  }

  /**
   * Endpoint 11 - Atualiza metadados de SEO (meta title e meta description) de taxonomy
   * @param params - Parâmetros com ID da taxonomy e metadados
   * @returns Promise com resposta da atualização
   */
  static async updateTaxonomyMetadata(
    params: Partial<UpdateTaxonomyMetadataRequest> & {
      pe_id_taxonomy: number;
      pe_meta_title: string;
      pe_meta_description: string;
    },
  ): Promise<UpdateTaxonomyMetadataResponse> {
    try {
      // Validar parâmetros
      const validatedParams = UpdateTaxonomyMetadataSchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_meta_title: params.pe_meta_title,
        pe_meta_description: params.pe_meta_description,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload(validatedParams);

      const data: UpdateTaxonomyMetadataResponse =
        await instance.post<UpdateTaxonomyMetadataResponse>(
          TAXONOMY_ENDPOINTS.UPDATE_METADATA,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar metadados da taxonomy",
        );
      }

      return data;
    } catch (error) {
      logger.error(
        "Erro no serviço de atualização de metadados de taxonomy",
        error,
      );
      throw error;
    }
  }

  /**
   * Endpoint 12 - Atualiza nome de taxonomy
   * @param params - Parâmetros com ID da taxonomy e novo nome
   * @returns Promise com resposta da atualização
   */
  static async updateTaxonomyName(
    params: Partial<UpdateTaxonomyNameRequest> & {
      pe_id_taxonomy: number;
      pe_taxonomia: string;
    },
  ): Promise<UpdateTaxonomyNameResponse> {
    try {
      // Validar parâmetros
      const validatedParams = UpdateTaxonomyNameSchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_taxonomia: params.pe_taxonomia,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload(validatedParams);

      const data: UpdateTaxonomyNameResponse =
        await instance.post<UpdateTaxonomyNameResponse>(
          TAXONOMY_ENDPOINTS.UPDATE_NAME,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar nome da taxonomy");
      }

      return data;
    } catch (error) {
      logger.error("Erro no serviço de atualização de nome de taxonomy", error);
      throw error;
    }
  }

  /**
   * Endpoint 13 - Atualiza ordem de exibição de taxonomy
   * @param params - Parâmetros com ID da taxonomy, parent ID e nova ordem
   * @returns Promise com resposta da atualização
   */
  static async updateTaxonomyOrdem(
    params: Partial<UpdateTaxonomyOrdemRequest> & {
      pe_parent_id: number;
      pe_id_taxonomy: number;
      pe_ordem: number;
    },
  ): Promise<UpdateTaxonomyOrdemResponse> {
    try {
      // Validar parâmetros
      const validatedParams = UpdateTaxonomyOrdemSchema.parse({
        pe_parent_id: params.pe_parent_id,
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_ordem: params.pe_ordem,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload(validatedParams);

      const data: UpdateTaxonomyOrdemResponse =
        await instance.post<UpdateTaxonomyOrdemResponse>(
          TAXONOMY_ENDPOINTS.UPDATE_ORDEM,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar ordem da taxonomy");
      }

      return data;
    } catch (error) {
      logger.error(
        "Erro no serviço de atualização de ordem de taxonomy",
        error,
      );
      throw error;
    }
  }

  /**
   * Endpoint 14 - Atualiza ID da taxonomy pai (move na hierarquia)
   * @param params - Parâmetros com ID da taxonomy e novo parent ID
   * @returns Promise com resposta da atualização
   */
  static async updateTaxonomyParentId(
    params: Partial<UpdateTaxonomyParentIdRequest> & {
      pe_id_taxonomy: number;
      pe_parent_id: number;
    },
  ): Promise<UpdateTaxonomyParentIdResponse> {
    try {
      // Validar parâmetros
      const validatedParams = UpdateTaxonomyParentIdSchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_parent_id: params.pe_parent_id,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload(validatedParams);

      const data: UpdateTaxonomyParentIdResponse =
        await instance.post<UpdateTaxonomyParentIdResponse>(
          TAXONOMY_ENDPOINTS.UPDATE_PARENT_ID,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(data.message || "Erro ao atualizar ID pai da taxonomy");
      }

      return data;
    } catch (error) {
      logger.error(
        "Erro no serviço de atualização de parent ID de taxonomy",
        error,
      );
      throw error;
    }
  }

  /**
   * Endpoint 15 - Atualiza caminho da imagem de taxonomy
   * @param params - Parâmetros com ID da taxonomy e caminho da imagem
   * @returns Promise com resposta da atualização
   */
  static async updateTaxonomyPathImage(
    params: Partial<UpdateTaxonomyPathImageRequest> & {
      pe_id_taxonomy: number;
      pe_path_imagem: string;
    },
  ): Promise<UpdateTaxonomyPathImageResponse> {
    try {
      // Validar parâmetros
      const validatedParams = UpdateTaxonomyPathImageSchema.parse({
        pe_id_taxonomy: params.pe_id_taxonomy,
        pe_path_imagem: params.pe_path_imagem,
      });

      const instance = new TaxonomyServiceApi();
      const requestBody = TaxonomyServiceApi.buildBasePayload(validatedParams);

      const data: UpdateTaxonomyPathImageResponse =
        await instance.post<UpdateTaxonomyPathImageResponse>(
          TAXONOMY_ENDPOINTS.UPDATE_PATH_IMAGE,
          requestBody,
        );

      if (isApiError(data.statusCode)) {
        throw new Error(
          data.message || "Erro ao atualizar caminho da imagem da taxonomy",
        );
      }

      return data;
    } catch (error) {
      logger.error(
        "Erro no serviço de atualização de caminho de imagem de taxonomy",
        error,
      );
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Extrai lista de taxonomias da resposta da API (menu)
   * @param response - Resposta da API
   * @returns Lista de taxonomias ou array vazio
   */
  static extractTaxonomyMenuList(
    response: FindTaxonomyMenuResponse,
  ): TaxonomyData[] {
    return response.data?.[0] ?? [];
  }

  /**
   * Extrai lista de taxonomias da resposta da API (busca)
   * @param response - Resposta da API
   * @returns Lista de taxonomias ou array vazio
   */
  static extractTaxonomyList(response: FindTaxonomyResponse): TaxonomyData[] {
    return response.data?.[0] ?? [];
  }

  /**
   * Extrai dados da taxonomy da resposta da API
   * @param response - Resposta da API
   * @returns Dados da taxonomy ou null
   */
  static extractTaxonomyData(
    response: FindTaxonomyByIdResponse,
  ): TaxonomyData | null {
    return response.data?.[0]?.[0] ?? null;
  }

  /**
   * Extrai resposta da stored procedure
   * @param response - Resposta da API com stored procedure
   * @returns Resposta da stored procedure ou null
   */
  static extractStoredProcedureResponse(
    response:
      | CreateTaxonomyResponse
      | UpdateTaxonomyResponse
      | DeleteTaxonomyResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[0]?.[0] ?? null;
  }

  /**
   * Extrai ID do registro criado/atualizado
   * @param response - Resposta da API
   * @returns ID do registro ou null
   */
  static extractRecordId(
    response:
      | CreateTaxonomyResponse
      | UpdateTaxonomyResponse
      | DeleteTaxonomyResponse,
  ): number | null {
    const spResponse =
      TaxonomyServiceApi.extractStoredProcedureResponse(response);
    return spResponse ? spResponse.sp_return_id : null;
  }

  /**
   * Extrai lista de taxonomias relacionadas ao produto da resposta da API
   * @param response - Resposta da API
   * @returns Lista de taxonomias ou array vazio
   */
  static extractTaxonomyProductList(
    response: FindTaxonomyRelProdutoResponse,
  ): TaxonomyProductData[] {
    return response.data?.[0] ?? [];
  }

  /**
   * Extrai resposta da stored procedure de relacionamento
   * @param response - Resposta da API com stored procedure
   * @returns Resposta da stored procedure ou null
   */
  static extractRelStoredProcedureResponse(
    response: CreateTaxonomyRelResponse | DeleteTaxonomyRelResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[0]?.[0] ?? null;
  }

  /**
   * Extrai ID do relacionamento criado/deletado
   * @param response - Resposta da API
   * @returns ID do relacionamento ou null
   */
  static extractRelRecordId(
    response: CreateTaxonomyRelResponse | DeleteTaxonomyRelResponse,
  ): number | null {
    const spResponse =
      TaxonomyServiceApi.extractRelStoredProcedureResponse(response);
    return spResponse ? spResponse.sp_return_id : null;
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  /**
   * Valida se a resposta de busca de taxonomias (menu) é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidTaxonomyMenuResponse(
    response: FindTaxonomyMenuResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }

  /**
   * Valida se a resposta de busca de taxonomias é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidTaxonomyResponse(response: FindTaxonomyResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }

  /**
   * Valida se a resposta de busca de taxonomy por ID é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidTaxonomyByIdResponse(
    response: FindTaxonomyByIdResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      response.data[0] &&
      response.data[0][0] !== undefined
    );
  }

  /**
   * Valida se a resposta de operação (create/update/delete) é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidOperationResponse(
    response:
      | CreateTaxonomyResponse
      | UpdateTaxonomyResponse
      | DeleteTaxonomyResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      response.data[0] &&
      response.data[0][0] !== undefined
    );
  }

  /**
   * Verifica se a operação foi bem-sucedida baseado na stored procedure
   * @param response - Resposta da API
   * @returns true se bem-sucedida, false caso contrário
   */
  static isOperationSuccessful(
    response:
      | CreateTaxonomyResponse
      | UpdateTaxonomyResponse
      | DeleteTaxonomyResponse,
  ): boolean {
    const spResponse =
      TaxonomyServiceApi.extractStoredProcedureResponse(response);
    return spResponse ? spResponse.sp_error_id === 0 : false;
  }

  /**
   * Valida se a resposta de listagem de taxonomias relacionadas ao produto é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidTaxonomyProductResponse(
    response: FindTaxonomyRelProdutoResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }

  /**
   * Valida se a resposta de operação de relacionamento (create/delete) é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidRelOperationResponse(
    response: CreateTaxonomyRelResponse | DeleteTaxonomyRelResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      response.data[0] &&
      response.data[0][0] !== undefined
    );
  }

  /**
   * Verifica se a operação de relacionamento foi bem-sucedida baseado na stored procedure
   * @param response - Resposta da API
   * @returns true se bem-sucedida, false caso contrário
   */
  static isRelOperationSuccessful(
    response: CreateTaxonomyRelResponse | DeleteTaxonomyRelResponse,
  ): boolean {
    const spResponse =
      TaxonomyServiceApi.extractRelStoredProcedureResponse(response);
    return spResponse ? spResponse.sp_error_id === 0 : false;
  }
}
