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
    inactive?: number;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIBrand[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.brands);

  if (!params.pe_system_client_id) {
    return [];
  }

  try {
    const response = await brandServiceApi.findAllBrands({
      pe_brand_id: params.brandId,
      pe_brand: params.brand,
      pe_inactive: params.inactive,
      pe_limit: params.limit,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const brands = brandServiceApi.extractBrands(response);
    return transformBrandList(brands);
  } catch (error) {
    logger.error("Erro ao buscar marcas:", error);
    return [];
  }
}

export async function getBrandById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIBrand | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.brand(String(id)), CACHE_TAGS.brands);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  try {
    const response = await brandServiceApi.findBrandById({
      pe_brand_id: id,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
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
