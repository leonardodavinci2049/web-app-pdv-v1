"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderOperationsServiceApi } from "@/services/api-main/order-operations";
import { OrderOperationsError } from "@/services/api-main/order-operations/types/order-operations-types";
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

    if (!customerId || !productId || !quantity || quantity < 1) {
      return {
        success: false,
        message: "Dados inválidos para adicionar item.",
      };
    }

    let targetOrderId = orderId;

    if (!targetOrderId) {
      const createOrderResponse = await orderOperationsServiceApi.createOrder({
        pe_customer_id: customerId,
        pe_seller_id: apiContext.pe_person_id,
        pe_business_type: 1,
        pe_payment_form_id: 1,
        pe_location_id: 1,
        pe_notes: "PDV ONLINE",
        ...apiContext,
      });

      targetOrderId =
        createOrderResponse.data?.[0]?.sp_return_id ??
        createOrderResponse.recordId;

      if (!targetOrderId) {
        return {
          success: false,
          message: "Não foi possível obter o ID do pedido criado.",
        };
      }
    }

    await orderOperationsServiceApi.addItem({
      pe_order_id: targetOrderId,
      pe_customer_id: customerId,
      pe_seller_id: apiContext.pe_person_id,
      pe_product_id: productId,
      pe_product_quantity: quantity,
      pe_payment_form_id: 1,
      pe_business_type: 1,
      pe_notes: "PDV ONLINE",
      ...apiContext,
    });

    revalidateTag(CACHE_TAGS.orderItems, "seconds");
    revalidateTag(CACHE_TAGS.orderSale(String(targetOrderId)), "hours");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");
    revalidatePath("/dashboard/order/new-budget");

    return {
      success: true,
      message: "Item adicionado ao carrinho!",
      data: { orderId: targetOrderId },
    };
  } catch (error) {
    logger.error("Erro ao adicionar item:", error);

    if (error instanceof OrderOperationsError) {
      return {
        success: false,
        message: error.message,
      };
    }

    const fallbackMessage =
      error instanceof Error ? error.message : "Erro ao adicionar item.";

    return {
      success: false,
      message: fallbackMessage,
    };
  }
}
