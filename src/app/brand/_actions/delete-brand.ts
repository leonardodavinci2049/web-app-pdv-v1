"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";
import { brandServiceApi } from "@/services/api-main/brand";

const logger = createLogger("deleteBrandAction");

type State = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
} | null;

export async function deleteBrandAction(
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

    const response = await brandServiceApi.deleteBrand({
      pe_brand_id: Number(brandId),
      pe_organization_id: session.session?.activeOrganizationId ?? "1",
      pe_user_id: session.user.id ?? "1",
      pe_member_role: session.user.role ?? "admin",
      pe_person_id: 1,
    });

    const result = brandServiceApi.extractStoredProcedureResult(response);

    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao deletar marca",
      };
    }

    revalidateTag("brands", "max");
    revalidateTag(`brand:${brandId}`, "max");

    return {
      success: true,
      message: "Marca removida com sucesso!",
    };
  } catch (error) {
    logger.error("Erro ao deletar marca:", error);
    return {
      success: false,
      message: "Erro ao deletar marca. Tente novamente.",
    };
  }
}
