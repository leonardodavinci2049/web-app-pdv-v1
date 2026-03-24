"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import {
  CRM_ACTIVITY_TYPES,
  CrmActivityService,
  type CrmActivityType,
} from "@/services/db/crm-activity";
import { CrmLeadService } from "@/services/db/crm-lead";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("crmActivityActions");

const activityFormSchema = z.object({
  leadId: z.string().trim().min(1, "Lead é obrigatório."),
  activityType: z
    .string()
    .refine(
      (v): v is CrmActivityType =>
        CRM_ACTIVITY_TYPES.includes(v as CrmActivityType),
      "Tipo de atividade inválido.",
    ),
  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória.")
    .max(5000, "Descrição muito longa."),
});

export async function createActivityAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const rawData = {
    leadId: (formData.get("leadId") as string) ?? "",
    activityType: (formData.get("activityType") as string) ?? "",
    description: (formData.get("description") as string) ?? "",
  };

  const parsed = activityFormSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString() ?? "form";
      errors[field] = issue.message;
    }
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors,
    };
  }

  const result = await CrmActivityService.createActivity({
    leadId: parsed.data.leadId,
    organizationId,
    activityType: parsed.data.activityType as CrmActivityType,
    description: parsed.data.description,
    createdBy: session.user.id,
  });

  if (!result.success) {
    logger.error("Erro ao registrar atividade", result.error);
    return {
      success: false,
      message: result.error ?? "Erro ao registrar atividade.",
    };
  }

  await CrmLeadService.updateLead({
    leadId: parsed.data.leadId,
    organizationId,
    lastContactAt: new Date(),
    updatedBy: session.user.id,
  });

  revalidateTag(CACHE_TAGS.crmActivitiesByLead(parsed.data.leadId), "seconds");
  revalidateTag(CACHE_TAGS.crmActivities, "seconds");
  revalidateTag(CACHE_TAGS.crmLead(parsed.data.leadId), "seconds");
  revalidateTag(CACHE_TAGS.crmDashboard, "seconds");

  return { success: true, message: "Atividade registrada com sucesso." };
}
