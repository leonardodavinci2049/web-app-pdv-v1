"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";
import { CACHE_TAGS } from "@/lib/cache-config";
import { brandServiceApi } from "@/services/api-main/brand";

const logger = createLogger("createBrandAction");

type State = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
} | null;

export async function createBrandAction(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect("/sign-in");
    }

    const brandName = (formData.get("brand") as string) || "";
    const slugInput = (formData.get("slug") as string) || "";
    // Gera slug automaticamente a partir do nome da marca se não fornecido
    const generatedSlug = brandName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const rawData = {
      pe_brand: brandName,
      pe_slug: slugInput || generatedSlug,
      pe_image_path: (formData.get("image_path") as string) || undefined,
      pe_notes: (formData.get("notes") as string) || undefined,
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: session.session?.activeOrganizationId ?? "1",
      pe_user_id: session.user.id ?? "1",
      pe_member_role: session.user.role ?? "admin",
      pe_person_id: 1,
    };

    const response = await brandServiceApi.createBrand(rawData);
    const result = brandServiceApi.extractStoredProcedureResult(response);

    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao criar marca",
      };
    }

    revalidateTag(CACHE_TAGS.brands, "seconds");

    return {
      success: true,
      message: "Marca criada com sucesso!",
    };
  } catch (error) {
    logger.error("Erro ao criar marca:", error);
    return {
      success: false,
      message: "Erro ao criar marca. Tente novamente.",
    };
  }
}
