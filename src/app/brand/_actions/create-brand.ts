"use server";

import { revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { brandServiceApi } from "@/services/api-main/brand";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("createBrandAction");

export async function createBrandAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { apiContext } = await getAuthContext();

    const brandName = (formData.get("brand") as string) || "";
    const slugInput = (formData.get("slug") as string) || "";
    // Gera slug automaticamente a partir do nome da marca se não fornecido
    const generatedSlug = brandName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const rawData = {
      pe_brand: brandName,
      pe_slug: slugInput || generatedSlug,
      pe_image_path: (formData.get("image_path") as string) || undefined,
      pe_notes: (formData.get("notes") as string) || undefined,
      ...apiContext,
    };

    const response = await brandServiceApi.createBrand(rawData);
    const result = brandServiceApi.extractStoredProcedureResult(response);

    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao criar marca",
      };
    }

    revalidateTag(CACHE_TAGS.brands, "seconds");

    return {
      success: true,
      message: "Marca criada com sucesso!",
    };
  } catch (error) {
    logger.error("Erro ao criar marca:", error);
    return {
      success: false,
      message: "Erro ao criar marca. Tente novamente.",
    };
  }
}
