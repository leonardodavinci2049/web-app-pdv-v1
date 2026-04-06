"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { orderSalesServiceApi } from "@/services/api-main/order-sales/order-sales-service-api";
import { orderUpdServiceApi } from "@/services/api-main/order-upd";

const logger = createLogger("sales-dashboard-update-order-inline-field-action");
const EDITABLE_ORDER_STATUS_ID = 22;

const EditableOrderFieldSchema = z.object({
  orderId: z.number().int().positive(),
  field: z.enum(["VL_FRETE", "VL_DESCONTO", "ANOTACOES"]),
  value: z.string().max(500),
});

type UpdateOrderInlineFieldResult = {
  success: boolean;
  message: string;
};

function parseDecimalValue(value: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 0;
  }

  const sanitizedValue = trimmedValue.replace(/\s|R\$/g, "");
  const lastCommaIndex = sanitizedValue.lastIndexOf(",");
  const lastDotIndex = sanitizedValue.lastIndexOf(".");

  const normalizedValue =
    lastCommaIndex > lastDotIndex
      ? sanitizedValue.replace(/\./g, "").replace(",", ".")
      : sanitizedValue.replace(/,/g, "");

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

export async function updateOrderInlineFieldAction(
  orderId: number,
  field: "VL_FRETE" | "VL_DESCONTO" | "ANOTACOES",
  value: string,
): Promise<UpdateOrderInlineFieldResult> {
  try {
    const validated = EditableOrderFieldSchema.parse({ orderId, field, value });
    const { apiContext } = await getAuthContext();
    const dashboardResponse = await orderSalesServiceApi.findDashboardId({
      pe_order_id: validated.orderId,
      pe_id_seller: apiContext.pe_person_id,
      pe_type_business: 1,
      ...apiContext,
    });

    const dashboardDetails = dashboardResponse
      ? orderSalesServiceApi.extractDashboardDetails(dashboardResponse)
      : null;

    if (!dashboardDetails) {
      return {
        success: false,
        message: "Nao foi possivel validar o status atual do pedido",
      };
    }

    if (dashboardDetails.ID_STATUS_PEDIDO !== EDITABLE_ORDER_STATUS_ID) {
      return {
        success: false,
        message: "Somente pedidos em orcamento podem ser editados",
      };
    }

    if (validated.field === "ANOTACOES") {
      await orderUpdServiceApi.updateField({
        ...apiContext,
        pe_register_id: validated.orderId,
        pe_field_type: 1,
        pe_field: validated.field,
        pe_value_str: validated.value.trim(),
        pe_value_int: 0,
        pe_value_numeric: 0,
        pe_value_date: null,
      });
    } else {
      const parsedNumericValue = parseDecimalValue(validated.value);

      if (parsedNumericValue === null) {
        return {
          success: false,
          message: "Informe um valor numerico valido para o campo selecionado",
        };
      }

      await orderUpdServiceApi.updateField({
        ...apiContext,
        pe_register_id: validated.orderId,
        pe_field_type: 3,
        pe_field: validated.field,
        pe_value_str: "",
        pe_value_int: 0,
        pe_value_numeric: parsedNumericValue,
        pe_value_date: null,
      });
    }

    revalidateTag(CACHE_TAGS.orderSale(String(validated.orderId)), "seconds");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");

    return {
      success: true,
      message: "Campo do pedido atualizado com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao atualizar campo inline do pedido", error);

    return {
      success: false,
      message:
        error instanceof z.ZodError
          ? "Dados invalidos para atualizar o campo do pedido"
          : "Nao foi possivel atualizar o campo do pedido",
    };
  }
}
