"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderItemsServiceApi } from "@/services/api-main/order-items";
import { OrderItemsError } from "@/services/api-main/order-items/types/order-items-types";

const logger = createLogger("new-budget-update-quantity-action");

const UpdateQuantitySchema = z.object({
  orderItemId: z.number().int().positive(),
  orderId: z.number().int().positive(),
  quantity: z.number().int().min(1),
});

type UpdateQuantityActionResult = {
  success: boolean;
  message: string;
};

export async function updateQuantityAction(
  orderItemId: number,
  orderId: number,
  quantity: number,
): Promise<UpdateQuantityActionResult> {
  try {
    const validated = UpdateQuantitySchema.parse({
      orderItemId,
      orderId,
      quantity,
    });
    const { apiContext } = await getAuthContext();

    await orderItemsServiceApi.updateQuantity({
      ...apiContext,
      pe_order_item_id: validated.orderItemId,
      pe_quantity: validated.quantity,
    });

    revalidateTag(CACHE_TAGS.orderItems, "seconds");
    revalidateTag(CACHE_TAGS.orderSale(String(validated.orderId)), "hours");

    return {
      success: true,
      message: "Quantidade atualizada com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao atualizar quantidade do item do orçamento", error);

    return {
      success: false,
      message:
        error instanceof z.ZodError
          ? "Dados inválidos para atualização de quantidade"
          : error instanceof OrderItemsError
            ? error.message
            : "Erro ao atualizar quantidade do item",
    };
  }
}
