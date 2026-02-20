"use server";

import { headers } from "next/headers";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";
import { brandServiceApi } from "@/services/api-main/brand";

const logger = createLogger("getBrandAction");

export async function getBrandAction(brandId: number) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error("Não autorizado");
    }

    const response = await brandServiceApi.findBrandById({
      pe_brand_id: brandId,
      pe_organization_id: session.session?.activeOrganizationId ?? "1",
      pe_user_id: session.user.id ?? "1",
      pe_member_role: session.user.role ?? "admin",
      pe_person_id: 1,
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
