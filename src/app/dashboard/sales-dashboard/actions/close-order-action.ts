"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import {
  OrderOperationsError,
  orderOperationsServiceApi,
} from "@/services/api-main/order-operations";
import { orderSalesServiceApi } from "@/services/api-main/order-sales/order-sales-service-api";

const logger = createLogger("sales-dashboard-close-order-action");

const CLOSEABLE_ORDER_STATUS_ID = 22;

const CloseOrderSchema = z.object({
  orderId: z.number().int().positive(),
});

type CloseOrderActionResult = {
  success: boolean;
  message: string;
};

export async function closeOrderAction(
  orderId: number,
): Promise<CloseOrderActionResult> {
  try {
    const validatedOrderId = CloseOrderSchema.parse({ orderId }).orderId;
    const { apiContext } = await getAuthContext();

    const dashboardResponse = await orderSalesServiceApi.findDashboardId({
      pe_order_id: validatedOrderId,
      pe_id_seller:
        apiContext.pe_person_id && apiContext.pe_person_id > 0
          ? apiContext.pe_person_id
          : undefined,
      pe_type_business: 1,
      ...apiContext,
    });

    const orderDetails = dashboardResponse
      ? orderSalesServiceApi.extractDashboardDetails(dashboardResponse)
      : null;

    if (!orderDetails) {
      return {
        success: false,
        message: "Pedido não encontrado para validação",
      };
    }

    if (orderDetails.ID_STATUS_PEDIDO !== CLOSEABLE_ORDER_STATUS_ID) {
      return {
        success: false,
        message: "Pedido não está com status de orçamento",
      };
    }

    const response = await orderOperationsServiceApi.closeOrder({
      pe_order_id: validatedOrderId,
      ...apiContext,
    });

    revalidateTag(CACHE_TAGS.orderSale(String(validatedOrderId)), "hours");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    return {
      success: true,
      message:
        response.message ||
        response.data?.[0]?.sp_message ||
        "Pedido fechado com sucesso",
    };
  } catch (error) {
    if (error instanceof OrderOperationsError) {
      return {
        success: false,
        message: error.message,
      };
    }

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "ID do pedido inválido",
      };
    }

    logger.error("Erro ao finalizar pedido", error);

    return {
      success: false,
      message: "Erro ao finalizar pedido",
    };
  }
}
