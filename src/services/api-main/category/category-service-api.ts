import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  TAXONOMY_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  StoredProcedureResponse,
  TaxonomyWebMenuRequest,
  TaxonomyWebMenuResponse,
  TblTaxonomyWebMenu,
} from "./types/category-types";
import { CategoryError } from "./types/category-types";
import { TaxonomyWebMenuSchema } from "./validation/category-schemas";

const logger = createLogger("CategoryServiceApi");

export class CategoryServiceApi extends BaseApiService {
  /**
   * Constrói payload base com dados do tenant
   */
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

  /**
   * Busca menu hierárquico de categorias (taxonomias)
   *
   * @param params - Parâmetros da requisição
   * @param params.pe_id_tipo - Tipo de taxonomia desejado (ex.: menu web)
   * @param params.pe_parent_id - (Opcional) Limita busca a partir de um nó pai específico
   * @returns Menu hierárquico com três níveis de categorias
   *
   * @example
   * ```typescript
   * // Buscar menu completo
   * const menu = await CategoryServiceApi.findMenu({ pe_id_tipo: 2 });
   *
   * // Buscar submenu a partir de um nó pai
   * const submenu = await CategoryServiceApi.findMenu({
   *   pe_id_tipo: 2,
   *   pe_parent_id: 10
   * });
   * ```
   */
  static async findMenu(
    params: Pick<TaxonomyWebMenuRequest, "pe_id_tipo"> &
      Partial<Pick<TaxonomyWebMenuRequest, "pe_parent_id">>,
  ): Promise<TaxonomyWebMenuResponse> {
    try {
      // Build payload without undefined values
      const payloadInput: Record<string, unknown> = {
        pe_id_tipo: params.pe_id_tipo,
      };

      // Only include pe_parent_id if it's defined
      if (params.pe_parent_id !== undefined) {
        payloadInput.pe_parent_id = params.pe_parent_id;
      }

      const validatedParams = TaxonomyWebMenuSchema.parse(payloadInput);

      const instance = new CategoryServiceApi();
      const requestBody = CategoryServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const response = await instance.post<TaxonomyWebMenuResponse>(
        TAXONOMY_ENDPOINTS.FIND_MENU,
        requestBody,
      );

      // Treat NOT_FOUND as empty result instead of error
      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        return {
          ...response,
          statusCode: API_STATUS_CODES.SUCCESS,
          data: [
            [],
            [
              {
                sp_return_id: 0,
                sp_message: "Nenhuma categoria encontrada",
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

      if (isApiError(response.statusCode)) {
        throw new CategoryError(
          response.message || "Erro ao buscar menu de categorias",
          "CATEGORY_FIND_MENU_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro no serviço de categorias (busca de menu)", error);
      throw error;
    }
  }

  /**
   * Extrai array hierárquico de categorias da resposta
   *
   * @param response - Resposta do endpoint taxonomy-find-menu
   * @returns Array de categorias com propriedade `children` para navegação hierárquica
   *
   * @example
   * ```typescript
   * const response = await CategoryServiceApi.findMenu({ pe_id_tipo: 2 });
   * const categories = CategoryServiceApi.extractCategories(response);
   *
   * categories.forEach(category => {
   *   console.log(category.TAXONOMIA);
   *   category.children?.forEach(child => {
   *     console.log(`  - ${child.TAXONOMIA}`);
   *   });
   * });
   * ```
   */
  static extractCategories(
    response: TaxonomyWebMenuResponse,
  ): TblTaxonomyWebMenu[] {
    return response.data?.[0] ?? [];
  }

  /**
   * Extrai feedback da stored procedure
   *
   * @param response - Resposta do endpoint taxonomy-find-menu
   * @returns Objeto com informações da execução da stored procedure
   */
  static extractFeedback(
    response: TaxonomyWebMenuResponse,
  ): StoredProcedureResponse {
    return (
      response.data?.[1]?.[0] ?? {
        sp_return_id: 0,
        sp_message: "",
        sp_error_id: 0,
      }
    );
  }

  /**
   * Valida se a resposta contém categorias válidas
   *
   * @param response - Resposta do endpoint taxonomy-find-menu
   * @returns `true` se a resposta contém dados válidos de categorias
   *
   * @example
   * ```typescript
   * const response = await CategoryServiceApi.findMenu({ pe_id_tipo: 2 });
   *
   * if (CategoryServiceApi.isValidMenuResponse(response)) {
   *   const categories = CategoryServiceApi.extractCategories(response);
   *   // Processar categorias...
   * }
   * ```
   */
  static isValidMenuResponse(response: TaxonomyWebMenuResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }

  /**
   * Conta o número total de categorias na árvore hierárquica
   *
   * @param categories - Array de categorias (pode conter children)
   * @returns Total de categorias incluindo todos os níveis
   *
   * @example
   * ```typescript
   * const response = await CategoryServiceApi.findMenu({ pe_id_tipo: 2 });
   * const categories = CategoryServiceApi.extractCategories(response);
   * const total = CategoryServiceApi.countCategories(categories);
   * console.log(`Total de categorias: ${total}`);
   * ```
   */
  static countCategories(categories: TblTaxonomyWebMenu[]): number {
    let count = categories.length;

    for (const category of categories) {
      if (category.children && category.children.length > 0) {
        count += CategoryServiceApi.countCategories(category.children);
      }
    }

    return count;
  }

  /**
   * Busca uma categoria específica na árvore hierárquica por ID
   *
   * @param categories - Array de categorias
   * @param id - ID da categoria a ser encontrada
   * @returns Categoria encontrada ou `null`
   *
   * @example
   * ```typescript
   * const response = await CategoryServiceApi.findMenu({ pe_id_tipo: 2 });
   * const categories = CategoryServiceApi.extractCategories(response);
   * const category = CategoryServiceApi.findCategoryById(categories, 3403);
   * ```
   */
  static findCategoryById(
    categories: TblTaxonomyWebMenu[],
    id: number,
  ): TblTaxonomyWebMenu | null {
    for (const category of categories) {
      if (category.ID_TAXONOMY === id) {
        return category;
      }

      if (category.children && category.children.length > 0) {
        const found = CategoryServiceApi.findCategoryById(
          category.children,
          id,
        );
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Converte árvore hierárquica em lista flat (achatada)
   *
   * @param categories - Array de categorias hierárquicas
   * @returns Array flat com todas as categorias
   *
   * @example
   * ```typescript
   * const response = await CategoryServiceApi.findMenu({ pe_id_tipo: 2 });
   * const hierarchical = CategoryServiceApi.extractCategories(response);
   * const flat = CategoryServiceApi.flattenCategories(hierarchical);
   * ```
   */
  static flattenCategories(
    categories: TblTaxonomyWebMenu[],
  ): TblTaxonomyWebMenu[] {
    const flat: TblTaxonomyWebMenu[] = [];

    for (const category of categories) {
      const { children, ...categoryWithoutChildren } = category;
      flat.push(categoryWithoutChildren);

      if (children && children.length > 0) {
        flat.push(...CategoryServiceApi.flattenCategories(children));
      }
    }

    return flat;
  }
}
