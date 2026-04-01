"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
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
    const peCpf = (formData.get("pe_cpf") as string) || "";
    const peCnpj = (formData.get("pe_cnpj") as string) || "";
    const peCompanyName = (formData.get("pe_company_name") as string) || "";
    const pePhone = (formData.get("pe_phone") as string) || "";
    const peWhatsapp = (formData.get("pe_whatsapp") as string) || "";
    const peImage = (formData.get("pe_image") as string) || "";
    const peZipCode = (formData.get("pe_zip_code") as string) || "";
    const peAddress = (formData.get("pe_address") as string) || "";
    const peAddressNumber = (formData.get("pe_address_number") as string) || "";
    const peComplement = (formData.get("pe_complement") as string) || "";
    const peNeighborhood = (formData.get("pe_neighborhood") as string) || "";
    const peCity = (formData.get("pe_city") as string) || "";
    const peState = (formData.get("pe_state") as string) || "";
    const peNotes = (formData.get("pe_notes") as string) || "";

    const fieldValues = {
      pe_name: peName,
      pe_email: peEmail,
      pe_person_type_id: String(pePersonTypeId),
      pe_cpf: peCpf,
      pe_cnpj: peCnpj,
      pe_company_name: peCompanyName,
      pe_phone: pePhone,
      pe_whatsapp: peWhatsapp,
      pe_image: peImage,
      pe_zip_code: peZipCode,
      pe_address: peAddress,
      pe_address_number: peAddressNumber,
      pe_complement: peComplement,
      pe_neighborhood: peNeighborhood,
      pe_city: peCity,
      pe_state: peState,
      pe_notes: peNotes,
    };

    if (!peName.trim() || !peEmail.trim()) {
      return {
        success: false,
        message: "Nome e e-mail são obrigatórios.",
        fieldValues,
      };
    }

    const rawData = {
      pe_name: peName.trim(),
      pe_email: peEmail.trim(),
      pe_person_type_id: pePersonTypeId,
      pe_cpf: peCpf.replace(/\D/g, ""),
      pe_cnpj: peCnpj.replace(/\D/g, ""),
      pe_company_name: peCompanyName.trim(),
      pe_phone: pePhone.replace(/\D/g, ""),
      pe_whatsapp: peWhatsapp.replace(/\D/g, ""),
      pe_image: peImage.trim(),
      pe_zip_code: peZipCode.replace(/\D/g, ""),
      pe_address: peAddress.trim(),
      pe_address_number: peAddressNumber.trim(),
      pe_complement: peComplement.trim(),
      pe_neighborhood: peNeighborhood.trim(),
      pe_city: peCity.trim(),
      pe_state: peState.trim(),
      pe_notes: peNotes.trim(),
      ...apiContext,
    };

    const response = await customerGeneralServiceApi.createCustomer(rawData);
    const result = response.data?.[0];

    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao criar cliente.",
        fieldValues,
      };
    }

    revalidateTag(CACHE_TAGS.customers, "hours");

    const customerId = result?.sp_return_id ?? response.recordId;

    redirect(`/dashboard/customer/${customerId}`);
  } catch (error) {
    logger.error("Erro ao criar cliente:", error);
    return {
      success: false,
      message: "Erro ao criar cliente. Tente novamente.",
      fieldValues: Object.fromEntries(
        [
          "pe_name",
          "pe_email",
          "pe_person_type_id",
          "pe_cpf",
          "pe_cnpj",
          "pe_company_name",
          "pe_phone",
          "pe_whatsapp",
          "pe_image",
          "pe_zip_code",
          "pe_address",
          "pe_address_number",
          "pe_complement",
          "pe_neighborhood",
          "pe_city",
          "pe_state",
          "pe_notes",
        ].map((key) => [key, (formData.get(key) as string) || ""]),
      ),
    };
  }
}
