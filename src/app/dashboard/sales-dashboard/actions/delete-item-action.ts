"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderItemsServiceApi } from "@/services/api-main/order-items";
import { OrderItemsError } from "@/services/api-main/order-items/types/order-items-types";

const logger = createLogger("sales-dashboard-delete-item-action");

const DeleteItemSchema = z.object({
  movementId: z.number().int().positive(),
});

type DeleteItemActionResult = {
  success: boolean;
  message: string;
};

export async function deleteItemAction(
  movementId: number,
): Promise<DeleteItemActionResult> {
  try {
    const validated = DeleteItemSchema.parse({ movementId });
    const { apiContext } = await getAuthContext();

    await orderItemsServiceApi.deleteOrderItem({
      ...apiContext,
      pe_movement_id: validated.movementId,
    });

    revalidateTag(CACHE_TAGS.orderItems, "seconds");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    return {
      success: true,
      message: "Item excluído com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao excluir item do pedido", error);
    return {
      success: false,
      message:
        error instanceof z.ZodError
          ? "Dados inválidos para exclusão do item"
          : error instanceof OrderItemsError
            ? error.message
            : "Erro ao excluir item do pedido",
    };
  }
}
