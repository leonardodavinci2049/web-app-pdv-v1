import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";

import { brandServiceApi } from "./brand-service-api";
import {
  transformBrand,
  transformBrandList,
  type UIBrand,
} from "./transformers/transformers";

const logger = createLogger("brand-cached-service");

export async function getBrands(
  params: {
    brandId?: number;
    brand?: string;
    limit?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_member_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIBrand[]> {
  "use cache";
  cacheLife("frequent");
  cacheTag(CACHE_TAGS.brands);

  try {
    const response = await brandServiceApi.findAllBrands({
      pe_brand_id: params.brandId,
      pe_brand: params.brand,
      pe_limit: params.limit,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_member_role: params.pe_member_role,
      pe_person_id: params.pe_person_id,
    });

    const brands = brandServiceApi.extractBrands(response);
    return transformBrandList(brands);
  } catch (error) {
    logger.error("Erro ao buscar marcas:", error);
    return [];
  }
}

export async function getBrandById(id: number): Promise<UIBrand | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.brand(String(id)), CACHE_TAGS.brands);

  try {
    const response = await brandServiceApi.findBrandById({
      pe_brand_id: id,
    });

    const brand = brandServiceApi.extractBrandById(response);
    if (!brand) {
      return undefined;
    }

    return transformBrand(brand) ?? undefined;
  } catch (error) {
    logger.error(`Erro ao buscar marca por ID ${id}:`, error);
    return undefined;
  }
}
