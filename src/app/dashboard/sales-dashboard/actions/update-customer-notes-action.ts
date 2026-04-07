"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderSalesServiceApi } from "@/services/api-main/order-sales/order-sales-service-api";
import {
  CustomerInlineError,
  customerInlineServiceApi,
} from "@/services/api-main/customer-inline";

const logger = createLogger("sales-dashboard-update-customer-notes-action");
const EDITABLE_ORDER_STATUS_ID = 22;

const UpdateCustomerNotesSchema = z.object({
  orderId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  notes: z.string(),
});

type UpdateCustomerNotesActionResult = {
  success: boolean;
  message: string;
};

export async function updateCustomerNotesAction(
  orderId: number,
  customerId: number,
  notes: string,
): Promise<UpdateCustomerNotesActionResult> {
  try {
    const validated = UpdateCustomerNotesSchema.parse({
      orderId,
      customerId,
      notes,
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

    await customerInlineServiceApi.updateField({
      ...apiContext,
      pe_register_id: validated.customerId,
      pe_field_type: 1,
      pe_field: "ANOTACOES",
      pe_value_str: validated.notes.trim(),
      pe_value_int: 0,
      pe_value_numeric: 0,
      pe_value_date: null,
    });

    revalidateTag(CACHE_TAGS.orderSale(String(validated.orderId)), "seconds");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    return {
      success: true,
      message: "Anotacoes do cliente atualizadas com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao atualizar anotacoes do cliente", error);

    if (error instanceof CustomerInlineError) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao atualizar anotacoes do cliente",
    };
  }
}
