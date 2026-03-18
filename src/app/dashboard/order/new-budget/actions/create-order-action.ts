"use server";

import { revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderOperationsServiceApi } from "@/services/api-main/order-operations";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("createOrderAction");

type CreateOrderActionState =
  | (ActionState & {
      data?: { orderId: number };
    })
  | null;

export async function createOrderAction(
  _prevState: CreateOrderActionState,
  formData: FormData,
): Promise<CreateOrderActionState> {
  try {
    const { apiContext } = await getAuthContext();

    const customerId = Number(formData.get("customerId"));
    if (!customerId) {
      return {
        success: false,
        message: "ID do cliente não fornecido.",
      };
    }

    const response = await orderOperationsServiceApi.createOrder({
      pe_customer_id: customerId,
      pe_seller_id: apiContext.pe_person_id,
      pe_business_type: 1,
      pe_payment_form_id: 1,
      pe_location_id: 1,
      pe_notes: "PDV ONLINE",
      ...apiContext,
    });

    const result = response.data?.[0];
    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao criar pedido.",
      };
    }

    const orderId = result?.sp_return_id ?? response.recordId;
    if (!orderId) {
      return {
        success: false,
        message: "Não foi possível obter o ID do pedido criado.",
      };
    }

    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    return {
      success: true,
      message: "Pedido criado com sucesso!",
      data: { orderId },
    };
  } catch (error) {
    logger.error("Erro ao criar pedido:", error);
    return {
      success: false,
      message: "Erro ao criar pedido. Tente novamente.",
    };
  }
}
