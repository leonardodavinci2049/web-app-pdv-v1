"use server";

/**
 * Server Actions para gerenciamento de categorias (taxonomias)
 *
 * Este arquivo contém Server Actions que interagem com o serviço de taxonomias
 * seguindo os padrões de segurança e arquitetura do projeto.
 */

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createLogger } from "@/lib/logger";
import { getAuthContext } from "@/server/auth-context";
import { taxonomyBaseServiceApi } from "@/services/api-main/taxonomy-base";
import type {
  UITaxonomy,
  UITaxonomyMenuItem,
} from "@/services/api-main/taxonomy-base/transformers/transformers";
import {
  transformTaxonomyDetail,
  transformTaxonomyList,
  transformTaxonomyMenuList,
} from "@/services/api-main/taxonomy-base/transformers/transformers";

const logger = createLogger("ActionCategories");

/**
 * Interface para parâmetros de busca de categorias
 */
export interface FindCategoriesParams {
  searchTerm?: string;
  searchType?: "name" | "id";
  sortColumn?: number;
  sortOrder?: number;
  filterStatus?: number;
  page?: number;
  perPage?: number;
  parentId?: number;
}

/**
 * Interface para resposta de busca de categorias
 */
export interface FindCategoriesResponse {
  success: boolean;
  data: UITaxonomy[];
  hasMore: boolean;
  total: number;
  error?: string;
}

/**
 * Busca categorias com filtros e paginação
 *
 * @param params - Parâmetros de busca
 * @returns Resultado da busca com dados das categorias
 */
export async function findCategories(
  params: FindCategoriesParams = {},
): Promise<FindCategoriesResponse> {
  try {
    const { apiContext } = await getAuthContext();

    // Extrair parâmetros com valores padrão
    const {
      searchTerm = "",
      searchType = "name",
      sortColumn = 2, // Padrão: Mais Recente (coluna 2)
      sortOrder = 2, // Padrão: Ordem 2 (decrescente - mais recente primeiro)
      filterStatus = 0, // Apenas ativos
      page = 0, // Página inicial (MySQL começa em 0)
      perPage = 20,
      parentId = -1, // Buscar todos os níveis
    } = params;

    // Construir parâmetros de busca
    let searchParam = "";
    if (searchTerm) {
      if (searchType === "id") {
        const idNumber = Number.parseInt(searchTerm, 10);
        if (Number.isNaN(idNumber)) {
          return {
            success: true,
            data: [],
            hasMore: false,
            total: 0,
          };
        }
        searchParam = searchTerm;
      } else {
        searchParam = searchTerm;
      }
    }

    // Chamar novo serviço da API
    const response = await taxonomyBaseServiceApi.findAllTaxonomies({
      pe_parent_id: parentId,
      pe_search: searchParam,
      pe_flag_inactive: filterStatus,
      pe_records_quantity: perPage,
      pe_page_id: page,
      pe_column_id: sortColumn,
      pe_order_id: sortOrder,
      ...apiContext,
    });

    // Extrair e transformar lista de taxonomias
    const rawCategories = taxonomyBaseServiceApi.extractTaxonomies(response);
    const categories = transformTaxonomyList(rawCategories);

    // Verificar se há mais páginas
    // Se retornou a quantidade solicitada, provavelmente há mais
    const hasMore = categories.length === perPage;
    /* 
    logger.info(`Categorias carregadas: ${categories.length}, página: ${page}`);
 */
    return {
      success: true,
      data: categories,
      hasMore,
      total: response.quantity || categories.length,
    };
  } catch (error) {
    logger.error("Erro ao buscar categorias", error);
    return {
      success: false,
      data: [],
      hasMore: false,
      total: 0,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao buscar categorias",
    };
  }
}

/**
 * Busca uma categoria específica por ID
 *
 * @param id - ID da categoria
 * @returns Dados da categoria ou null
 */
export async function findCategoryById(id: number): Promise<UITaxonomy | null> {
  try {
    const { apiContext } = await getAuthContext();

    // Chamar novo serviço da API
    const response = await taxonomyBaseServiceApi.findTaxonomyById({
      pe_taxonomy_id: id,
      ...apiContext,
    });

    // Extrair e transformar dados da taxonomia
    const rawCategory = taxonomyBaseServiceApi.extractTaxonomyById(response);
    if (!rawCategory) return null;

    return transformTaxonomyDetail(rawCategory);
  } catch (error) {
    logger.error(`Erro ao buscar categoria ID ${id}`, error);
    return null;
  }
}

/**
 * Busca o nome da categoria pai
 *
 * @param parentId - ID da categoria pai
 * @returns Nome da categoria pai ou "Raiz"
 */
export async function getCategoryParentName(parentId: number): Promise<string> {
  if (parentId === 0 || parentId === null) {
    return "Raiz";
  }

  try {
    const parent = await findCategoryById(parentId);
    return parent?.name || `ID ${parentId}`;
  } catch (error) {
    logger.error(`Erro ao buscar nome da categoria pai ${parentId}`, error);
    return `ID ${parentId}`;
  }
}

/**
 * Interface para parâmetros de atualização de categoria
 */
export interface UpdateCategoryParams {
  id: number;
  name: string;
  slug?: string;
  parentId?: number;
  metaTitle?: string;
  metaDescription?: string;
  notes?: string;
  order?: number;
  imagePath?: string;
  status?: number;
}

/**
 * Interface para resposta de atualização de categoria
 */
export interface UpdateCategoryResponse {
  success: boolean;
  message: string;
  data?: UITaxonomy;
  error?: string;
}

/**
 * Atualiza uma categoria existente
 *
 * @param params - Parâmetros de atualização
 * @returns Resultado da atualização
 */
export async function updateCategory(
  params: UpdateCategoryParams,
): Promise<UpdateCategoryResponse> {
  try {
    const { apiContext } = await getAuthContext();

    const {
      id,
      name,
      slug = "",
      parentId = 0,
      metaTitle = "",
      metaDescription = "",
      notes = "",
      order = 1,
      imagePath = "",
      status = 0,
    } = params;

    // Chamar novo serviço da API para atualizar
    await taxonomyBaseServiceApi.updateTaxonomy({
      pe_taxonomy_id: id,
      pe_taxonomy_name: name,
      pe_slug: slug,
      pe_parent_id: parentId,
      pe_meta_title: metaTitle,
      pe_meta_description: metaDescription,
      pe_info: notes,
      pe_sort_order: order,
      pe_image_path: imagePath,
      pe_inactive: status,
      ...apiContext,
    });

    // Buscar dados atualizados
    const updatedCategory = await findCategoryById(id);

    logger.info(`Categoria ${id} atualizada com sucesso`);

    return {
      success: true,
      message: "Categoria atualizada com sucesso",
      data: updatedCategory || undefined,
    };
  } catch (error) {
    logger.error("Erro ao atualizar categoria", error);
    return {
      success: false,
      message: "Erro ao atualizar categoria",
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao atualizar categoria",
    };
  }
}

/**
 * Interface para parâmetros de criação de categoria
 * Reflete APENAS os campos aceitos pelo endpoint POST /taxonomy/v2/taxonomy-create
 */
export interface CreateCategoryParams {
  name: string; // pe_taxonomia - OBRIGATÓRIO
  slug: string; // pe_slug - OBRIGATÓRIO
  parentId?: number; // pe_parent_id - OBRIGATÓRIO (default: 0)
  level?: number; // pe_level - OBRIGATÓRIO (default: 1)
  type?: number; // pe_id_tipo - OBRIGATÓRIO (default: 1)
}

/**
 * Interface para resposta de criação de categoria
 */
export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  recordId?: number;
  data?: UITaxonomy;
  error?: string;
}

/**
 * Server Action to load categories menu for client components
 * Uses pe_id_tipo = 2 for product categories as per API documentation
 * @returns Promise with categories data or error
 */
export async function loadCategoriesMenuAction() {
  try {
    const { apiContext } = await getAuthContext();

    // Use pe_id_tipo = 2 for product categories (based on API documentation)
    const response = await taxonomyBaseServiceApi.findTaxonomyMenu({
      pe_type_id: 2,
      pe_parent_id: 0,
      ...apiContext,
    });

    if (taxonomyBaseServiceApi.isValidTaxonomyMenu(response)) {
      const rawTaxonomies =
        taxonomyBaseServiceApi.extractTaxonomyMenu(response);
      const taxonomies = transformTaxonomyMenuList(rawTaxonomies);

      return {
        success: true,
        data: taxonomies,
        message: "Categorias carregadas com sucesso",
      };
    }
    throw new Error("Resposta inválida da API de taxonomias");
  } catch (error) {
    logger.error("Error loading categories menu in server action", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro ao carregar categorias";

    return {
      success: false,
      data: [],
      message: errorMessage,
    };
  }
}

/**
 * Busca categorias para usar como opções de categoria pai
 * Usa o endpoint de menu que retorna hierarquia organizada
 * Retorna apenas níveis 1 e 2 (Família e Grupo)
 *
 * @returns Lista de categorias para seleção (níveis 1 e 2)
 */
export async function getCategoryOptions(): Promise<UITaxonomyMenuItem[]> {
  try {
    const { apiContext } = await getAuthContext();

    // Buscar hierarquia de categorias usando endpoint de menu
    const response = await taxonomyBaseServiceApi.findTaxonomyMenu({
      pe_type_id: 1,
      pe_parent_id: 0,
      ...apiContext,
    });

    // Verificar se resposta é válida
    if (!taxonomyBaseServiceApi.isValidTaxonomyMenu(response)) {
      logger.error("Resposta inválida do endpoint de menu");
      return [];
    }

    // Extrair e transformar hierarquia de taxonomias
    const rawMenuItems = taxonomyBaseServiceApi.extractTaxonomyMenu(response);
    const menuItems = transformTaxonomyMenuList(rawMenuItems);

    return menuItems;
  } catch (error) {
    logger.error("Erro ao buscar opções de categorias", error);
    return [];
  }
}
/**
 * Server Action modernizado para criação de categoria
 * Usa Next.js 15 FormData com validação Zod explícita
 */
export async function createCategoryAction(formData: FormData) {
  "use server";

  try {
    // 1. Extrair dados do FormData
    const rawData = {
      name: formData.get("name") as string,
      parentId: formData.get("parentId") as string,
    };

    // 2. Validar dados com Zod
    const { CreateCategoryServerSchema } = await import(
      "@/lib/validations/category-validations"
    );

    let validated: {
      name: string;
      parentId: number;
    };
    try {
      validated = CreateCategoryServerSchema.parse({
        name: rawData.name,
        parentId: rawData.parentId,
      });
    } catch (validationError) {
      logger.error("Erro de validação", validationError);
      throw new Error("Dados do formulário inválidos");
    }

    const { generateSlugFromName } = await import(
      "@/lib/validations/category-validations"
    );

    const slug = generateSlugFromName(validated.name);
    if (!slug) {
      logger.error("Falha ao gerar slug a partir do nome", {
        name: validated.name,
      });
      throw new Error("Não foi possível gerar o slug da categoria");
    }

    // 3. Verificar autenticação
    const { apiContext } = await getAuthContext();

    // 4. Chamar novo serviço da API para criar
    const response = await taxonomyBaseServiceApi.createTaxonomy({
      pe_taxonomy_name: validated.name,
      pe_slug: slug,
      pe_parent_id: validated.parentId,
      pe_level: 1,
      pe_type_id: 1,
      ...apiContext,
    });

    // 5. Extrair resultado - novo serviço lança exceção em caso de erro
    const spResult =
      taxonomyBaseServiceApi.extractStoredProcedureResult(response);
    if (!spResult || spResult.sp_return_id <= 0) {
      throw new Error("Falha ao criar categoria");
    }

    // 7. Redirect automático em caso de sucesso (Next.js 15 pattern)
    const { redirect } = await import("next/navigation");
    redirect("/dashboard/category/category-list");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logger.error("Erro ao criar categoria", error);

    // Re-throw com mensagem user-friendly
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erro interno do servidor");
  }
}

export async function createCategory(
  params: CreateCategoryParams,
): Promise<CreateCategoryResponse> {
  try {
    const { apiContext } = await getAuthContext();

    // Extrair apenas os campos aceitos pelo endpoint de criação
    const {
      name,
      slug,
      parentId = 0,
      level = 1,
      type = 2, // Valor padrão conforme API reference
    } = params;

    // Chamar novo serviço da API para criar (apenas campos suportados)
    const response = await taxonomyBaseServiceApi.createTaxonomy({
      pe_taxonomy_name: name,
      pe_slug: slug,
      pe_parent_id: parentId,
      pe_level: level,
      pe_type_id: type,
      ...apiContext,
    });

    // Extrair resultado - novo serviço lança exceção em caso de erro
    const spResult =
      taxonomyBaseServiceApi.extractStoredProcedureResult(response);
    const recordId = spResult?.sp_return_id;

    if (!recordId || recordId <= 0) {
      const errorMsg =
        spResult?.sp_message || "Falha ao criar categoria na API";
      throw new Error(errorMsg);
    }

    // Buscar dados da categoria criada
    const createdCategory = await findCategoryById(recordId);

    return {
      success: true,
      message: "Categoria criada com sucesso",
      recordId,
      data: createdCategory || undefined,
    };
  } catch (error) {
    logger.error("Erro ao criar categoria", error);
    return {
      success: false,
      message: "Erro ao criar categoria",
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar categoria",
    };
  }
}

/**
 * Interface para resposta de exclusão de categoria
 */
export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Deleta uma categoria (soft delete)
 *
 * @param categoryId - ID da categoria a ser deletada
 * @returns Resultado da operação de exclusão
 */
export async function deleteCategory(
  categoryId: number,
): Promise<DeleteCategoryResponse> {
  try {
    const { apiContext } = await getAuthContext();

    // Chamar novo serviço de API para deletar
    const response = await taxonomyBaseServiceApi.deleteTaxonomy({
      pe_taxonomy_id: categoryId,
      ...apiContext,
    });

    // Extrair mensagem de sucesso da stored procedure
    const spResponse =
      taxonomyBaseServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message ||
      response.message ||
      "Categoria deletada com sucesso";

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    logger.error("Erro ao deletar categoria", error);
    return {
      success: false,
      message: "Erro ao deletar categoria",
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao deletar categoria",
    };
  }
}
