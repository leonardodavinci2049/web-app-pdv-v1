import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";

import { supplierServiceApi } from "./supplier-service-api";
import {
  transformSupplier,
  transformSupplierList,
  transformSupplierRelProdList,
  type UISupplier,
  type UISupplierRelProd,
} from "./transformers/transformers";

const logger = createLogger("supplier-cached-service");

export async function getSuppliers(
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
): Promise<UISupplier[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.suppliers);

  if (!params.pe_system_client_id) {
    return [];
  }

  try {
    const response = await supplierServiceApi.findAllSuppliers({
      pe_search: params.search,
      pe_limit: params.limit,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const suppliers = supplierServiceApi.extractSuppliers(response);
    return transformSupplierList(suppliers);
  } catch (error) {
    logger.error("Erro ao buscar fornecedores:", error);
    return [];
  }
}

export async function getSupplierById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UISupplier | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.supplier(String(id)), CACHE_TAGS.suppliers);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  try {
    const response = await supplierServiceApi.findSupplierById({
      pe_supplier_id: id,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const supplier = supplierServiceApi.extractSupplierById(response);
    if (!supplier) {
      return undefined;
    }

    return transformSupplier(supplier) ?? undefined;
  } catch (error) {
    logger.error(`Erro ao buscar fornecedor por ID ${id}:`, error);
    return undefined;
  }
}

export async function getSupplierRelProds(
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
): Promise<UISupplierRelProd[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.suppliersRelProd);

  if (!params.pe_system_client_id) {
    return [];
  }

  try {
    const response = await supplierServiceApi.findAllSupplierRelProds({
      pe_search: params.search,
      pe_limit: params.limit,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const relProds = supplierServiceApi.extractSupplierRelProds(response);
    return transformSupplierRelProdList(relProds);
  } catch (error) {
    logger.error("Erro ao buscar relações fornecedor-produto:", error);
    return [];
  }
}
