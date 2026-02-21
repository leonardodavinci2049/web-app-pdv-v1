"use server";

import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { brandServiceApi } from "@/services/api-main/brand";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { transformBrand } from "@/services/api-main/brand/transformers/transformers";

const logger = createLogger("getBrandByIdAction");

export async function getBrandByIdAction(
  brandId: number,
): Promise<UIBrand | null> {
  try {
    const { apiContext } = await getAuthContext();

    const response = await brandServiceApi.findBrandById({
      pe_brand_id: brandId,
      ...apiContext,
    });

    const details = brandServiceApi.extractBrandById(response);
    return transformBrand(details);
  } catch (error) {
    logger.error("Erro ao buscar marca por ID:", error);
    return null;
  }
}
