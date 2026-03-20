"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderOperationsServiceApi } from "@/services/api-main/order-operations/order-operations-service-api";
import { OrderOperationsError } from "@/services/api-main/order-operations/types/order-operations-types";

const logger = createLogger("sales-dashboard-add-item-action");

const AddItemSchema = z.object({
  orderId: z.number().int().positive(),
  productId: z.number().int().positive(),
  customerId: z.number().int().nonnegative(),
  sellerId: z.number().int().nonnegative(),
  paymentFormId: z.number().int().nonnegative(),
  quantity: z.number().int().positive().default(1),
});

type AddItemActionResult = {
  success: boolean;
  message: string;
};

export async function addItemAction(params: {
  orderId: number;
  productId: number;
  customerId: number;
  sellerId: number;
  paymentFormId: number;
  quantity?: number;
}): Promise<AddItemActionResult> {
  try {
    const validated = AddItemSchema.parse(params);
    const { apiContext } = await getAuthContext();

    await orderOperationsServiceApi.addItem({
      ...apiContext,
      pe_order_id: validated.orderId,
      pe_product_id: validated.productId,
      pe_customer_id: validated.customerId,
      pe_seller_id: validated.sellerId,
      pe_payment_form_id: validated.paymentFormId,
      pe_product_quantity: validated.quantity,
      pe_business_type: 1,
      pe_notes: "",
    });

    revalidateTag(CACHE_TAGS.orderItems, "seconds");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    return {
      success: true,
      message: "Produto adicionado ao pedido com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao adicionar item ao pedido", error);
    return {
      success: false,
      message:
        error instanceof z.ZodError
          ? "Dados inválidos para adição do item"
          : error instanceof OrderOperationsError
            ? error.message
            : "Erro ao adicionar produto ao pedido",
    };
  }
}
