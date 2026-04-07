"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderSalesServiceApi } from "@/services/api-main/order-sales/order-sales-service-api";
import {
  CustomerUpdError,
  customerUpdServiceApi,
} from "@/services/api-main/customer-upd";

const logger = createLogger("sales-dashboard-update-customer-address-action");
const EDITABLE_ORDER_STATUS_ID = 22;

const UpdateCustomerAddressSchema = z.object({
  orderId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  zipCode: z.string().max(100),
  address: z.string().max(300),
  addressNumber: z.string().max(100),
  complement: z.string().max(100),
  neighborhood: z.string().max(300),
  city: z.string().max(300),
  state: z.string().max(100),
  municipalityCode: z.string().max(100),
  stateCode: z.string().max(100),
});

type UpdateCustomerAddressActionResult = {
  success: boolean;
  message: string;
};

function normalizeFieldValue(value: string): string {
  return value.trim();
}

export async function updateCustomerAddressAction(
  orderId: number,
  customerId: number,
  values: {
    zipCode: string;
    address: string;
    addressNumber: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    municipalityCode: string;
    stateCode: string;
  },
): Promise<UpdateCustomerAddressActionResult> {
  try {
    const validated = UpdateCustomerAddressSchema.parse({
      orderId,
      customerId,
      ...values,
    });
    const { apiContext } = await getAuthContext();
    const dashboardResponse = await orderSalesServiceApi.findDashboardId({
      pe_order_id: validated.orderId,
      pe_id_seller: apiContext.pe_person_id,
      pe_type_business: 1,
      ...apiContext,
    });

    const dashboardDetails = dashboardResponse
      ? orderSalesServiceApi.extractDashboardDetails(dashboardResponse)
      : null;

    if (!dashboardDetails) {
      return {
        success: false,
        message: "Nao foi possivel validar o status atual do pedido",
      };
    }

    if (dashboardDetails.ID_STATUS_PEDIDO !== EDITABLE_ORDER_STATUS_ID) {
      return {
        success: false,
        message: "Somente pedidos em orcamento podem ser editados",
      };
    }

    await customerUpdServiceApi.updateAddress({
      ...apiContext,
      pe_customer_id: validated.customerId,
      pe_zip_code: normalizeFieldValue(validated.zipCode),
      pe_address: normalizeFieldValue(validated.address),
      pe_address_number: normalizeFieldValue(validated.addressNumber),
      pe_complement: normalizeFieldValue(validated.complement),
      pe_neighborhood: normalizeFieldValue(validated.neighborhood),
      pe_city: normalizeFieldValue(validated.city),
      pe_state: normalizeFieldValue(validated.state),
      pe_city_code: normalizeFieldValue(validated.municipalityCode),
      pe_state_code: normalizeFieldValue(validated.stateCode),
    });

    revalidateTag(CACHE_TAGS.orderSale(String(validated.orderId)), "seconds");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");
    revalidateTag(CACHE_TAGS.customer(String(validated.customerId)), "seconds");
    revalidateTag(CACHE_TAGS.customers, "seconds");

    return {
      success: true,
      message: "Endereco do cliente atualizado com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao atualizar endereco do cliente", error);

    if (error instanceof CustomerUpdError) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao atualizar endereco do cliente",
    };
  }
}
