import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";

import { ptypeServiceApi } from "./ptype-service-api";
import {
  transformPtype,
  transformPtypeList,
  type UIPtype,
} from "./transformers/transformers";

const logger = createLogger("ptype-cached-service");

export async function getPtypes(
  params: {
    search?: string;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIPtype[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.ptypes);

  if (!params.pe_system_client_id) {
    return [];
  }

  try {
    const response = await ptypeServiceApi.findAllPtypes({
      pe_search: params.search,
      pe_limit: params.limit,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const ptypes = ptypeServiceApi.extractPtypes(response);
    return transformPtypeList(ptypes);
  } catch (error) {
    logger.error("Erro ao buscar tipos:", error);
    return [];
  }
}

export async function getPtypeById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIPtype | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.ptype(String(id)), CACHE_TAGS.ptypes);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  try {
    const response = await ptypeServiceApi.findPtypeById({
      pe_type_id: id,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const ptype = ptypeServiceApi.extractPtypeById(response);
    if (!ptype) {
      return undefined;
    }

    return transformPtype(ptype) ?? undefined;
  } catch (error) {
    logger.error(`Erro ao buscar tipo por ID ${id}:`, error);
    return undefined;
  }
}
