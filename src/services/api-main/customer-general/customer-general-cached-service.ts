import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";

import { customerGeneralServiceApi } from "./customer-general-service-api";
import {
  transformCustomerDetail,
  transformCustomerLatestProductList,
  transformCustomerList,
  transformSellerInfo,
  type UICustomerDetail,
  type UICustomerLatestProduct,
  type UICustomerListItem,
  type UISellerInfo,
} from "./transformers/transformers";

const logger = createLogger("customer-general-cached-service");

export async function getCustomers(
  params: {
    search?: string;
    qtRegistros?: number;
    pageId?: number;
    columnId?: number;
    orderId?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UICustomerListItem[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.customers);

  if (!params.pe_system_client_id) {
    return [];
  }

  try {
    const response = await customerGeneralServiceApi.findAllCustomers({
      pe_search: params.search,
      pe_qt_registros: params.qtRegistros,
      pe_page_id: params.pageId,
      pe_column_id: params.columnId,
      pe_order_id: params.orderId,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const customers = customerGeneralServiceApi.extractCustomers(response);
    return transformCustomerList(customers);
  } catch (error) {
    logger.error("Erro ao buscar clientes:", error);
    return [];
  }
}

export async function getCustomerById(
  customerId: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<
  { customer: UICustomerDetail; seller: UISellerInfo | null } | undefined
> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.customer(String(customerId)), CACHE_TAGS.customers);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  try {
    const response = await customerGeneralServiceApi.findCustomerById({
      pe_customer_id: customerId,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const customerEntity =
      customerGeneralServiceApi.extractCustomerById(response);
    if (!customerEntity) {
      return undefined;
    }

    const sellerEntity = customerGeneralServiceApi.extractSellerInfo(response);

    return {
      customer: transformCustomerDetail(customerEntity),
      seller: sellerEntity ? transformSellerInfo(sellerEntity) : null,
    };
  } catch (error) {
    logger.error(`Erro ao buscar cliente por ID ${customerId}:`, error);
    return undefined;
  }
}

export async function getCustomerLatestProducts(
  customerId: number,
  params: {
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UICustomerLatestProduct[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(
    CACHE_TAGS.customerLatestProducts(String(customerId)),
    CACHE_TAGS.customers,
  );

  if (!params.pe_system_client_id) {
    return [];
  }

  try {
    const response = await customerGeneralServiceApi.findLatestProducts({
      pe_customer_id: customerId,
      pe_limit: params.limit,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const products = customerGeneralServiceApi.extractLatestProducts(response);
    return transformCustomerLatestProductList(products);
  } catch (error) {
    logger.error(
      `Erro ao buscar últimos produtos do cliente ${customerId}:`,
      error,
    );
    return [];
  }
}
