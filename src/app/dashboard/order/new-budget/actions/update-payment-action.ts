"use server";

import { revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderUpdServiceApi } from "@/services/api-main/order-upd";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("updatePaymentAction");

export async function updatePaymentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { apiContext } = await getAuthContext();

    const orderId = Number(formData.get("orderId"));
    const pgMethodId = Number(formData.get("pgMethodId"));

    if (!orderId || !pgMethodId) {
      return {
        success: false,
        message: "Dados inválidos para atualizar pagamento.",
      };
    }

    const response = await orderUpdServiceApi.updatePgMethod({
      pe_order_id: orderId,
      pe_pg_method_id: pgMethodId,
      ...apiContext,
    });

    const result = response.data?.[0];
    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao atualizar forma de pagamento.",
      };
    }

    revalidateTag(CACHE_TAGS.orderSale(String(orderId)), "hours");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    return {
      success: true,
      message: "Forma de pagamento atualizada!",
    };
  } catch (error) {
    logger.error("Erro ao atualizar pagamento:", error);
    return {
      success: false,
      message: "Erro ao atualizar pagamento. Tente novamente.",
    };
  }
}
