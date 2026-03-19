"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderOperationsServiceApi } from "@/services/api-main/order-operations";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("addItemAction");

export async function addItemAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { apiContext } = await getAuthContext();

    const orderId = Number(formData.get("orderId"));
    const customerId = Number(formData.get("customerId"));
    const productId = Number(formData.get("productId"));
    const quantity = Number(formData.get("quantity"));

    if (!orderId || !customerId || !productId || !quantity || quantity < 1) {
      return {
        success: false,
        message: "Dados inválidos para adicionar item.",
      };
    }

    const response = await orderOperationsServiceApi.addItem({
      pe_order_id: orderId,
      pe_customer_id: customerId,
      pe_seller_id: apiContext.pe_person_id,
      pe_product_id: productId,
      pe_product_quantity: quantity,
      pe_payment_form_id: 1,
      pe_business_type: 1,
      pe_notes: "PDV ONLINE",
      ...apiContext,
    });

    const result = response.data?.[0];
    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao adicionar item.",
      };
    }

    revalidateTag(CACHE_TAGS.orderItems, "seconds");
    revalidateTag(CACHE_TAGS.orderSale(String(orderId)), "hours");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");
    revalidatePath("/dashboard/order/new-budget");

    return {
      success: true,
      message: "Item adicionado ao carrinho!",
    };
  } catch (error) {
    logger.error("Erro ao adicionar item:", error);
    return {
      success: false,
      message: "Erro ao adicionar item. Tente novamente.",
    };
  }
}
