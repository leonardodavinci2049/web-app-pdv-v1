"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";
import { CACHE_TAGS } from "@/lib/cache-config";
import { brandServiceApi } from "@/services/api-main/brand/brand-service-api";

const logger = createLogger("brand-actions");

export interface MutationResult {
  success: boolean;
  data?: number;
  error?: string;
}

export async function createBrand(params: {
  brand: string;
  slug: string;
}): Promise<MutationResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  try {
    const response = await brandServiceApi.createBrand({
      pe_brand: params.brand,
      pe_slug: params.slug,
    });

    const result = brandServiceApi.extractStoredProcedureResult(response);
    if (result && result.sp_return_id > 0) {
      revalidateTag(CACHE_TAGS.brands, "frequent");
      return { success: true, data: result.sp_return_id };
    }

    return {
      success: false,
      error: result?.sp_message || "Erro desconhecido ao criar marca",
    };
  } catch (error) {
    logger.error("Erro ao criar marca:", error);
    return { success: false, error: "Erro ao criar marca" };
  }
}

export async function updateBrand(params: {
  brandId: number;
  brand?: string;
  slug?: string;
  imagePath?: string;
  notes?: string;
  inactive?: number;
}): Promise<MutationResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  try {
    const response = await brandServiceApi.updateBrand({
      pe_brand_id: params.brandId,
      pe_brand: params.brand,
      pe_slug: params.slug,
      pe_image_path: params.imagePath,
      pe_notes: params.notes,
      pe_inactive: params.inactive,
    });

    const result = brandServiceApi.extractStoredProcedureResult(response);
    if (result && result.sp_return_id > 0) {
      revalidateTag(CACHE_TAGS.brands, "frequent");
      const brandTag = CACHE_TAGS.brand(String(params.brandId));
      revalidateTag(brandTag, "hours");
      return { success: true, data: result.sp_return_id };
    }

    return {
      success: false,
      error: result?.sp_message || "Erro desconhecido ao atualizar marca",
    };
  } catch (error) {
    logger.error("Erro ao atualizar marca:", error);
    return { success: false, error: "Erro ao atualizar marca" };
  }
}

export async function deleteBrand(id: number): Promise<MutationResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  try {
    const response = await brandServiceApi.deleteBrand({
      pe_brand_id: id,
    });

    const result = brandServiceApi.extractStoredProcedureResult(response);
    if (result && result.sp_return_id > 0) {
      revalidateTag(CACHE_TAGS.brands, "frequent");
      const brandTag = CACHE_TAGS.brand(String(id));
      revalidateTag(brandTag, "hours");
      return { success: true, data: result.sp_return_id };
    }

    return {
      success: false,
      error: result?.sp_message || "Erro desconhecido ao excluir marca",
    };
  } catch (error) {
    logger.error("Erro ao excluir marca:", error);
    return { success: false, error: "Erro ao excluir marca" };
  }
}
