"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { createLogger } from "@/lib/logger";
import { taxonomyRelServiceApi } from "@/services/api-main/taxonomy-rel";
import {
  transformTaxonomyRelProductList,
  type UITaxonomyRelProduct,
} from "@/services/api-main/taxonomy-rel/transformers/transformers";

const logger = createLogger("TaxonomyActions");

/**
 * Server Action - Create taxonomy relationship (category-product)
 * @param taxonomyId - Taxonomy/Category ID
 * @param productId - Product ID
 * @returns Success or error result
 */
export async function createTaxonomyRelationship(
  taxonomyId: number,
  productId: number,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return { success: false, message: "Usuário não autenticado" };
    }

    // Novo serviço lança exceção em caso de erro
    await taxonomyRelServiceApi.createTaxonomyRelation({
      pe_taxonomy_id: taxonomyId,
      pe_record_id: productId,
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: session.session?.activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: 1,
    });

    // Revalidate product page to reflect changes
    revalidatePath(`/dashboard/product/${productId}`);
    revalidatePath("/dashboard/product/catalog");

    return {
      success: true,
      message: "Categoria adicionada com sucesso",
    };
  } catch (error) {
    logger.error("Error creating taxonomy relationship:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao adicionar categoria ao produto",
    };
  }
}

/**
 * Server Action - Delete taxonomy relationship (category-product)
 * @param taxonomyId - Taxonomy/Category ID
 * @param productId - Product ID
 * @returns Success or error result
 */
export async function deleteTaxonomyRelationship(
  taxonomyId: number,
  productId: number,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return { success: false, message: "Usuário não autenticado" };
    }

    // Novo serviço lança exceção em caso de erro
    await taxonomyRelServiceApi.deleteTaxonomyRelation({
      pe_taxonomy_id: taxonomyId,
      pe_record_id: productId,
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: session.session?.activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: 1,
    });

    // Revalidate product page to reflect changes
    revalidatePath(`/dashboard/product/${productId}`);
    revalidatePath("/dashboard/product/catalog");

    return {
      success: true,
      message: "Categoria removida com sucesso",
    };
  } catch (error) {
    logger.error("Error deleting taxonomy relationship:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao remover categoria do produto",
    };
  }
}

/**
 * Server Action - Fetch product categories (taxonomies)
 * Retorna categorias associadas ao produto
 * @param productId - Product ID
 * @returns List of product categories or error
 */
export async function fetchProductCategories(productId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return { success: false, data: [], message: "Usuário não autenticado" };
    }

    // Chamar novo serviço
    const response = await taxonomyRelServiceApi.findAllProductsByTaxonomy({
      pe_record_id: productId,
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: session.session?.activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: 1,
    });

    // Extrair e transformar categorias
    const rawCategories = taxonomyRelServiceApi.extractProducts(response);
    const categories = transformTaxonomyRelProductList(rawCategories);

    return {
      success: true,
      data: categories,
      message: "Categorias carregadas com sucesso",
    };
  } catch (error) {
    logger.error("Error fetching product categories:", error);

    return {
      success: false,
      data: [] as UITaxonomyRelProduct[],
      message:
        error instanceof Error
          ? error.message
          : "Erro ao carregar categorias do produto",
    };
  }
}
