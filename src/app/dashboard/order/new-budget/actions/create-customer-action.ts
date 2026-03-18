"use server";

import { revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { customerGeneralServiceApi } from "@/services/api-main/customer-general";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("createCustomerAction");

export async function createCustomerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { apiContext } = await getAuthContext();

    const peName = (formData.get("pe_name") as string) || "";
    const peEmail = (formData.get("pe_email") as string) || "";
    const pePersonTypeId = Number(formData.get("pe_person_type_id")) || 1;

    if (!peName.trim() || !peEmail.trim()) {
      return {
        success: false,
        message: "Nome e e-mail são obrigatórios.",
      };
    }

    const rawData = {
      pe_name: peName.trim(),
      pe_email: peEmail.trim(),
      pe_person_type_id: pePersonTypeId,
      pe_cpf: (formData.get("pe_cpf") as string) || "",
      pe_cnpj: (formData.get("pe_cnpj") as string) || "",
      pe_phone: (formData.get("pe_phone") as string) || "",
      pe_whatsapp: (formData.get("pe_whatsapp") as string) || "",
      pe_notes: (formData.get("pe_notes") as string) || "",
      ...apiContext,
    };

    const response = await customerGeneralServiceApi.createCustomer(rawData);
    const result = response.data?.[0];

    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao criar cliente.",
      };
    }

    revalidateTag(CACHE_TAGS.customers, "seconds");

    return {
      success: true,
      message: "Cliente criado com sucesso!",
    };
  } catch (error) {
    logger.error("Erro ao criar cliente:", error);
    return {
      success: false,
      message: "Erro ao criar cliente. Tente novamente.",
    };
  }
}
