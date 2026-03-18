"use server";

import { revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderOperationsServiceApi } from "@/services/api-main/order-operations";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("closeOrderAction");

export async function closeOrderAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { apiContext } = await getAuthContext();

    const orderId = Number(formData.get("orderId"));
    if (!orderId) {
      return {
        success: false,
        message: "ID do pedido não fornecido.",
      };
    }

    const response = await orderOperationsServiceApi.closeOrder({
      pe_order_id: orderId,
      ...apiContext,
    });

    const result = response.data?.[0];
    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao fechar pedido.",
      };
    }

    revalidateTag(CACHE_TAGS.orderSale(String(orderId)), "hours");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    return {
      success: true,
      message: "Pedido fechado com sucesso!",
    };
  } catch (error) {
    logger.error("Erro ao fechar pedido:", error);
    return {
      success: false,
      message: "Erro ao fechar pedido. Tente novamente.",
    };
  }
}
