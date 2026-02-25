"use server";

/**
 * Server Actions para gerenciamento de categorias (taxonomias)
 *
 * Este arquivo contém Server Actions que interagem com o serviço de taxonomias
 * seguindo os padrões de segurança e arquitetura do projeto.
 */

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { createLogger } from "@/lib/logger";
import { TaxonomyServiceApi } from "@/services/api/taxonomy/taxonomy-service-api";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";

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
  data: TaxonomyData[];
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
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.error("Usuário não autenticado");
      return {
        success: false,
        data: [],
        hasMore: false,
        total: 0,
        error: "Usuário não autenticado",
      };
    }

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

    // Construir parâmetros da API baseado no tipo de busca
    const apiParams: Record<string, unknown> = {
      pe_id_parent: parentId,
      pe_flag_inativo: filterStatus,
      pe_qt_registros: perPage,
      pe_pagina_id: page,
      pe_coluna_id: sortColumn,
      pe_ordem_id: sortOrder,
    };

    // Adicionar parâmetro de busca baseado no tipo
    if (searchTerm) {
      if (searchType === "id") {
        // Busca por ID
        const idNumber = Number.parseInt(searchTerm, 10);
        if (!Number.isNaN(idNumber)) {
          apiParams.pe_id_taxonomy = idNumber;
          apiParams.pe_taxonomia = "";
        } else {
          // ID inválido, retornar vazio
          return {
            success: true,
            data: [],
            hasMore: false,
            total: 0,
          };
        }
      } else {
        // Busca por nome
        apiParams.pe_taxonomia = searchTerm;
        apiParams.pe_id_taxonomy = 0;
      }
    } else {
      // Sem busca, definir valores padrão
      apiParams.pe_taxonomia = "";
      apiParams.pe_id_taxonomy = 0;
    }

    // Chamar serviço da API
    const response = await TaxonomyServiceApi.findTaxonomies(apiParams);

    // Extrair lista de taxonomias
    const categories = TaxonomyServiceApi.extractTaxonomyList(response);

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
export async function findCategoryById(
  id: number,
): Promise<TaxonomyData | null> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.error("Usuário não autenticado");
      return null;
    }

    // Chamar serviço da API
    const response = await TaxonomyServiceApi.findTaxonomyById({
      pe_id_taxonomy: id,
    });

    // Extrair dados da taxonomia
    const category = TaxonomyServiceApi.extractTaxonomyData(response);

    return category;
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
    return parent?.TAXONOMIA || `ID ${parentId}`;
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
  data?: TaxonomyData;
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
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.error("Usuário não autenticado");
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "Usuário não autenticado",
      };
    }

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

    // Chamar serviço da API para atualizar
    const response = await TaxonomyServiceApi.updateTaxonomy({
      pe_id_taxonomy: id,
      pe_taxonomia: name,
      pe_slug: slug,
      pe_parent_id: parentId,
      pe_meta_title: metaTitle,
      pe_meta_description: metaDescription,
      pe_info: notes,
      pe_ordem: order,
      pe_path_imagem: imagePath,
      pe_inativo: status,
    });

    // Validar resposta
    if (!TaxonomyServiceApi.isValidOperationResponse(response)) {
      throw new Error("Resposta inválida da API");
    }

    // Verificar se a operação foi bem-sucedida
    if (!TaxonomyServiceApi.isOperationSuccessful(response)) {
      throw new Error("Falha ao atualizar categoria na API");
    }

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
  data?: TaxonomyData;
  error?: string;
}

/**
 * Server Action to load categories menu for client components
 * Uses pe_id_tipo = 2 for product categories as per API documentation
 * @returns Promise with categories data or error
 */
export async function loadCategoriesMenuAction() {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.error("Usuário não autenticado para carregar menu de categorias");
      return {
        success: false,
        data: [],
        message: "Usuário não autenticado",
      };
    }

    // Use pe_id_tipo = 2 for product categories (based on API documentation)
    const response = await TaxonomyServiceApi.findTaxonomyMenu({
      pe_id_tipo: 2, // Product categories type
    });

    if (TaxonomyServiceApi.isValidTaxonomyMenuResponse(response)) {
      const taxonomies = TaxonomyServiceApi.extractTaxonomyMenuList(response);

      return {
        success: true,
        data: taxonomies,
        message: "Categorias carregadas com sucesso",
      };
    } else {
      throw new Error("Resposta inválida da API de taxonomias");
    }
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
export async function getCategoryOptions(): Promise<TaxonomyData[]> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.error("Usuário não autenticado");
      return [];
    }

    // Buscar hierarquia de categorias usando endpoint de menu
    const response = await TaxonomyServiceApi.findTaxonomyMenu({
      pe_id_tipo: 1, // Tipo de taxonomia (categorias)
      // pe_parent_id omitido para buscar desde a raiz
    });

    // Verificar se resposta é válida
    if (!TaxonomyServiceApi.isValidTaxonomyMenuResponse(response)) {
      logger.error("Resposta inválida do endpoint de menu");
      return [];
    }

    // Extrair hierarquia de taxonomias
    const hierarchicalCategories =
      TaxonomyServiceApi.extractTaxonomyMenuList(response);

    // Flatten hierarchy to include only levels 1 and 2
    // This prevents having level 4 categories (we only allow up to level 3)
    // Parent can only be level 1 (Family) or level 2 (Group), never level 3 (Subgroup)
    const flattenedOptions: TaxonomyData[] = [];

    for (const rootCategory of hierarchicalCategories) {
      // Add root category (level 1 - Family)
      flattenedOptions.push({
        ...rootCategory,
        LEVEL: rootCategory.LEVEL ?? 1,
      });

      // Add direct children (level 2 - Group) if they exist
      // Do NOT include level 3 (Subgroup) to prevent level 4 creation
      if (rootCategory.children && rootCategory.children.length > 0) {
        for (const childCategory of rootCategory.children) {
          flattenedOptions.push({
            ...childCategory,
            LEVEL: childCategory.LEVEL ?? 2,
            children: undefined, // Remove children property to flatten structure
          });
        }
      }
    }

    /*     logger.info(
      `Opções de categorias carregadas: ${flattenedOptions.length} (níveis 1 e 2)`,
    ); */

    return flattenedOptions;
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.error("Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }

    // 4. Chamar serviço da API para criar
    const response = await TaxonomyServiceApi.createTaxonomy({
      pe_taxonomia: validated.name,
      pe_slug: slug,
      pe_parent_id: validated.parentId,
      pe_level: 1,
      pe_id_tipo: 1, // Valor padrão conforme API reference
    });

    // 5. Validar resposta
    if (!TaxonomyServiceApi.isValidOperationResponse(response)) {
      throw new Error("Resposta inválida da API");
    }

    // 6. Verificar se operação foi bem-sucedida
    if (!TaxonomyServiceApi.isOperationSuccessful(response)) {
      logger.error("Falha ao criar categoria");
      throw new Error("Falha ao criar categoria");
    }

    /*     logger.info("Categoria criada com sucesso", {
      name: validated.name,
      slug,
      level: 1,
    }); */

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
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.error("Usuário não autenticado");
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "Usuário não autenticado",
      };
    }

    // Extrair apenas os campos aceitos pelo endpoint de criação
    const {
      name,
      slug,
      parentId = 0,
      level = 1,
      type = 2, // Valor padrão conforme API reference
    } = params;

    // Chamar serviço da API para criar (apenas campos suportados)
    const response = await TaxonomyServiceApi.createTaxonomy({
      pe_taxonomia: name,
      pe_slug: slug,
      pe_parent_id: parentId,
      pe_level: level,
      pe_id_tipo: type,
    });

    // Validar resposta
    if (!TaxonomyServiceApi.isValidOperationResponse(response)) {
      throw new Error("Resposta inválida da API");
    }

    // Verificar se a operação foi bem-sucedida
    if (!TaxonomyServiceApi.isOperationSuccessful(response)) {
      const errorMsg =
        TaxonomyServiceApi.extractStoredProcedureResponse(response)
          ?.sp_message || "Falha ao criar categoria na API";
      throw new Error(errorMsg);
    }

    // Extrair ID do registro criado
    const recordId = TaxonomyServiceApi.extractRecordId(response);

    if (!recordId) {
      throw new Error("ID do registro criado não foi retornado");
    }

    // Buscar dados da categoria criada
    const createdCategory = await findCategoryById(recordId);

    // logger.info(`Categoria criada com sucesso: ID ${recordId}, Nome: ${name}`);

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
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        message: "Não autorizado",
        error: "Usuário não autenticado",
      };
    }

    // logger.info(`Deletando categoria: ID ${categoryId}`);

    // Chamar serviço de API para deletar
    const response = await TaxonomyServiceApi.deleteTaxonomy({
      pe_id_taxonomy: categoryId,
    });

    // Validar resposta
    if (!TaxonomyServiceApi.isValidOperationResponse(response)) {
      throw new Error("Resposta inválida da API");
    }

    // Verificar se a operação foi bem-sucedida
    if (!TaxonomyServiceApi.isOperationSuccessful(response)) {
      const errorMsg =
        TaxonomyServiceApi.extractStoredProcedureResponse(response)
          ?.sp_message || "Falha ao deletar categoria";
      return {
        success: false,
        message: errorMsg,
        error: errorMsg,
      };
    }

    // Extrair mensagem de sucesso da stored procedure
    const spResponse =
      TaxonomyServiceApi.extractStoredProcedureResponse(response);
    const successMessage =
      spResponse?.sp_message ||
      response.message ||
      "Categoria deletada com sucesso";

    // logger.info(`Categoria deletada com sucesso: ID ${categoryId}`);

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
