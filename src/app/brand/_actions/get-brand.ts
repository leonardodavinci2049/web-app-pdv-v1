"use server";

import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { brandServiceApi } from "@/services/api-main/brand";

const logger = createLogger("getBrandAction");

export async function getBrandAction(brandId: number) {
  try {
    const { apiContext } = await getAuthContext();

    const response = await brandServiceApi.findBrandById({
      pe_brand_id: brandId,
      ...apiContext,
    });
    const brand = brandServiceApi.extractBrandById(response);

    if (!brand) {
      return null;
    }

    return {
      brand_id: brand.ID_MARCA,
      brand: brand.MARCA ?? brand.NOME ?? "",
      slug: "",
      image_path: "",
      notes: "",
      inactive: brand.INATIVO,
    };
  } catch (error) {
    logger.error("Erro ao buscar marca:", error);
    return null;
  }
}
