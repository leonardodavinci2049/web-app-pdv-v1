"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import {
  CustomerInlineError,
  customerInlineServiceApi,
} from "@/services/api-main/customer-inline";
import { orderSalesServiceApi } from "@/services/api-main/order-sales/order-sales-service-api";

const logger = createLogger(
  "sales-dashboard-update-customer-inline-field-action",
);
const EDITABLE_ORDER_STATUS_ID = 22;

const EDITABLE_CUSTOMER_FIELDS = {
  customerName: {
    apiField: "NOME",
    label: "Nome do cliente",
    normalizeValue: (value: string) => value.trim(),
  },
  phone: {
    apiField: "FONE1",
    label: "Telefone",
    normalizeValue: (value: string) => value.replace(/\D/g, ""),
  },
  whatsapp: {
    apiField: "WHATAPP1",
    label: "WhatsApp",
    normalizeValue: (value: string) => value.replace(/\D/g, ""),
  },
  email: {
    apiField: "EMAIL_DE_LOGIN",
    label: "E-mail",
    normalizeValue: (value: string) => value.trim(),
  },
  cpf: {
    apiField: "CPF",
    label: "CPF",
    normalizeValue: (value: string) => value.replace(/\D/g, ""),
  },
  rg: {
    apiField: "RG",
    label: "RG",
    normalizeValue: (value: string) => value.trim(),
  },
  companyName: {
    apiField: "RAZAO_SOCIAL",
    label: "Razao social",
    normalizeValue: (value: string) => value.trim(),
  },
  tradeName: {
    apiField: "NOME_FANTASIA",
    label: "Nome fantasia",
    normalizeValue: (value: string) => value.trim(),
  },
  cnpj: {
    apiField: "CNPJ",
    label: "CNPJ",
    normalizeValue: (value: string) => value.replace(/\D/g, ""),
  },
  stateRegistration: {
    apiField: "INSC_ESTADUAL",
    label: "Inscricao estadual",
    normalizeValue: (value: string) => value.trim(),
  },
  municipalRegistration: {
    apiField: "INSC_MUNICIPAL",
    label: "Inscricao municipal",
    normalizeValue: (value: string) => value.trim(),
  },
} as const;

const editableCustomerFieldKeys = Object.keys(EDITABLE_CUSTOMER_FIELDS) as [
  keyof typeof EDITABLE_CUSTOMER_FIELDS,
  ...(keyof typeof EDITABLE_CUSTOMER_FIELDS)[],
];

const UpdateCustomerInlineFieldSchema = z.object({
  orderId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  field: z.enum(editableCustomerFieldKeys),
  value: z.string().max(200),
});

type EditableCustomerFieldKey = keyof typeof EDITABLE_CUSTOMER_FIELDS;

type UpdateCustomerInlineFieldActionResult = {
  success: boolean;
  message: string;
};

function normalizeFieldValue(field: EditableCustomerFieldKey, value: string) {
  return EDITABLE_CUSTOMER_FIELDS[field].normalizeValue(value);
}

export async function updateCustomerInlineFieldAction(
  orderId: number,
  customerId: number,
  field: EditableCustomerFieldKey,
  value: string,
): Promise<UpdateCustomerInlineFieldActionResult> {
  try {
    const validated = UpdateCustomerInlineFieldSchema.parse({
      orderId,
      customerId,
      field,
      value,
    });

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

    await customerInlineServiceApi.updateField({
      ...apiContext,
      pe_register_id: validated.customerId,
      pe_field_type: 1,
      pe_field: EDITABLE_CUSTOMER_FIELDS[validated.field].apiField,
      pe_value_str: normalizeFieldValue(validated.field, validated.value),
      pe_value_int: 0,
      pe_value_numeric: 0,
      pe_value_date: null,
    });

    revalidateTag(CACHE_TAGS.orderSale(String(validated.orderId)), "seconds");
    revalidateTag(CACHE_TAGS.orderSales, "seconds");
    revalidateTag(CACHE_TAGS.customer(String(validated.customerId)), "seconds");
    revalidateTag(CACHE_TAGS.customers, "seconds");

    return {
      success: true,
      message: `${EDITABLE_CUSTOMER_FIELDS[validated.field].label} atualizado com sucesso`,
    };
  } catch (error) {
    logger.error("Erro ao atualizar campo inline do cliente", error);

    if (error instanceof CustomerInlineError) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao atualizar campo do cliente",
    };
  }
}
