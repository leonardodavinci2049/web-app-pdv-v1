"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderItemsServiceApi } from "@/services/api-main/order-items";

const logger = createLogger("sales-dashboard-update-quantity-action");

const UpdateQuantitySchema = z.object({
  orderItemId: z.number().int().positive(),
  quantity: z.number().int().min(1),
});

type UpdateQuantityActionResult = {
  success: boolean;
  message: string;
};

export async function updateQuantityAction(
  orderItemId: number,
  quantity: number,
): Promise<UpdateQuantityActionResult> {
  try {
    const validated = UpdateQuantitySchema.parse({ orderItemId, quantity });
    const { apiContext } = await getAuthContext();

    await orderItemsServiceApi.updateQuantity({
      ...apiContext,
      pe_order_item_id: validated.orderItemId,
      pe_quantity: validated.quantity,
    });

    revalidateTag(
      CACHE_TAGS.orderItem(String(validated.orderItemId)),
      "seconds",
    );
    revalidateTag(CACHE_TAGS.orderItems, "seconds");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    return {
      success: true,
      message: "Quantidade atualizada com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao atualizar quantidade do item", error);
    return {
      success: false,
      message:
        error instanceof z.ZodError
          ? "Dados inválidos para atualização de quantidade"
          : "Erro ao atualizar quantidade do item",
    };
  }
}
