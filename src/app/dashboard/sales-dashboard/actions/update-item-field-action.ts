"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderItemsServiceApi } from "@/services/api-main/order-items";
import { OrderItemsError } from "@/services/api-main/order-items/types/order-items-types";

const logger = createLogger("sales-dashboard-update-item-field-action");

const UpdateItemFieldSchema = z.object({
  movementId: z.number().int().positive(),
  field: z.enum(["VL_DESCONTO", "VL_ACRESCIMO"]),
  value: z.number().min(0),
});

type UpdateItemFieldActionResult = {
  success: boolean;
  message: string;
};

export async function updateItemFieldAction(
  movementId: number,
  field: "VL_DESCONTO" | "VL_ACRESCIMO",
  value: number,
): Promise<UpdateItemFieldActionResult> {
  try {
    const validated = UpdateItemFieldSchema.parse({ movementId, field, value });
    const { apiContext } = await getAuthContext();

    await orderItemsServiceApi.updateField({
      ...apiContext,
      pe_register_id: validated.movementId,
      pe_field_type: 3,
      pe_field: validated.field,
      pe_value_str: "",
      pe_value_int: 0,
      pe_value_numeric: validated.value,
      pe_value_date: null,
    });

    revalidateTag(CACHE_TAGS.orderItems, "seconds");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    const label = validated.field === "VL_DESCONTO" ? "Desconto" : "Acréscimo";

    return {
      success: true,
      message: `${label} atualizado com sucesso`,
    };
  } catch (error) {
    logger.error("Erro ao atualizar campo do item do pedido", error);
    return {
      success: false,
      message:
        error instanceof z.ZodError
          ? "Dados inválidos para atualização"
          : error instanceof OrderItemsError
            ? error.message
            : "Erro ao atualizar campo do item",
    };
  }
}
