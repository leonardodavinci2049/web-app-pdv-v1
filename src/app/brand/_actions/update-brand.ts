"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";
import { brandServiceApi } from "@/services/api-main/brand";

const logger = createLogger("updateBrandAction");

type State = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
} | null;

export async function updateBrandAction(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect("/sign-in");
    }

    const brandId = formData.get("brand_id");
    if (!brandId) {
      return {
        success: false,
        message: "ID da marca não fornecido.",
      };
    }

    const rawData = {
      pe_brand_id: Number(brandId),
      pe_brand: (formData.get("brand") as string) || undefined,
      pe_slug: (formData.get("slug") as string) || undefined,
      pe_image_path: (formData.get("image_path") as string) || undefined,
      pe_notes: (formData.get("notes") as string) || undefined,
      pe_inactive: formData.get("inactive")
        ? Number(formData.get("inactive"))
        : 0,
      pe_organization_id: session.session?.activeOrganizationId ?? "1",
      pe_user_id: session.user.id ?? "1",
      pe_member_role: session.user.role ?? "admin",
      pe_person_id: 1,
    };

    const response = await brandServiceApi.updateBrand(rawData);
    const result = brandServiceApi.extractStoredProcedureResult(response);

    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao atualizar marca",
      };
    }

    revalidateTag("brands", "");
    revalidateTag(`brand:${brandId}`, "");

    return {
      success: true,
      message: "Marca atualizada com sucesso!",
    };
  } catch (error) {
    logger.error("Erro ao atualizar marca:", error);
    return {
      success: false,
      message: "Erro ao atualizar marca. Tente novamente.",
    };
  }
}
