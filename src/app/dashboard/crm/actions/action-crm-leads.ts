"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { CrmActivityService } from "@/services/db/crm-activity";
import {
  CRM_LEAD_SOURCES,
  CrmLeadService,
  type CrmLeadSource,
} from "@/services/db/crm-lead";
import { CrmLeadStageHistoryService } from "@/services/db/crm-lead-stage-history";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("crmLeadActions");
const CRM_PATH = "/dashboard/crm";

function revalidateCrmLeads(orgId: string, leadId?: string) {
  revalidateTag(CACHE_TAGS.crmLeads, "seconds");
  revalidateTag(CACHE_TAGS.crmLeadsByOrg(orgId), "seconds");
  revalidateTag(CACHE_TAGS.crmPipeline, "seconds");
  revalidateTag(CACHE_TAGS.crmDashboard, "seconds");

  if (leadId) {
    revalidateTag(CACHE_TAGS.crmLead(leadId), "seconds");
    revalidateTag(CACHE_TAGS.crmActivitiesByLead(leadId), "seconds");
    revalidateTag(CACHE_TAGS.crmLeadStageHistory(leadId), "seconds");
  }

  revalidatePath(CRM_PATH);
}

const createLeadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres.")
    .max(255, "Nome muito longo."),
  phone: z.string().trim().max(30, "Telefone muito longo.").optional(),
  email: z
    .string()
    .trim()
    .email("Email inválido.")
    .max(255)
    .optional()
    .or(z.literal("")),
  source: z
    .string()
    .refine(
      (v): v is CrmLeadSource => CRM_LEAD_SOURCES.includes(v as CrmLeadSource),
      "Selecione uma origem válida.",
    ),
  estimatedValue: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseFloat(v) : undefined)),
  notes: z.string().trim().max(5000, "Observações muito longas.").optional(),
});

function getStringField(formData: FormData, key: string): string {
  return (formData.get(key) as string) ?? "";
}

function buildFieldValues(formData: FormData): Record<string, string> {
  const fields = [
    "name",
    "phone",
    "email",
    "source",
    "estimatedValue",
    "notes",
  ];
  const values: Record<string, string> = {};
  for (const field of fields) {
    values[field] = getStringField(formData, field);
  }
  return values;
}

export async function createLeadAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const rawData = {
    name: getStringField(formData, "name"),
    phone: getStringField(formData, "phone") || undefined,
    email: getStringField(formData, "email") || undefined,
    source: getStringField(formData, "source"),
    estimatedValue: getStringField(formData, "estimatedValue") || undefined,
    notes: getStringField(formData, "notes") || undefined,
  };

  const parsed = createLeadFormSchema.safeParse(rawData);
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
      fieldValues: buildFieldValues(formData),
    };
  }

  const result = await CrmLeadService.createLead({
    organizationId,
    assignedUserId: session.user.id,
    assignedUserName: session.user.name ?? "",
    name: parsed.data.name,
    phone: parsed.data.phone ?? null,
    email: parsed.data.email || null,
    source: parsed.data.source,
    estimatedValue: parsed.data.estimatedValue ?? null,
    notes: parsed.data.notes ?? null,
    createdBy: session.user.id,
  });

  if (!result.success) {
    logger.error("Erro ao criar lead", result.error);
    return {
      success: false,
      message: result.error ?? "Erro ao criar lead.",
      fieldValues: buildFieldValues(formData),
    };
  }

  const newLeadId = result.id;
  if (newLeadId) {
    await CrmLeadStageHistoryService.createStageTransition({
      leadId: newLeadId,
      fromStageKey: null,
      toStageKey: "lead",
      changedBy: session.user.id,
      notes: "Lead criado",
    });

    await CrmActivityService.createActivity({
      leadId: newLeadId,
      organizationId,
      activityType: "anotacao",
      description: `Lead "${parsed.data.name}" criado.`,
      createdBy: session.user.id,
    });
  }

  revalidateCrmLeads(organizationId, newLeadId);

  return {
    success: true,
    message: "Lead criado com sucesso.",
    data: { id: newLeadId ?? "" },
  };
}

export async function updateLeadAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const leadId = getStringField(formData, "leadId");
  if (!leadId) {
    return { success: false, message: "ID do lead não informado." };
  }

  const rawData = {
    name: getStringField(formData, "name"),
    phone: getStringField(formData, "phone") || undefined,
    email: getStringField(formData, "email") || undefined,
    source: getStringField(formData, "source"),
    estimatedValue: getStringField(formData, "estimatedValue") || undefined,
    notes: getStringField(formData, "notes") || undefined,
  };

  const parsed = createLeadFormSchema.safeParse(rawData);
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
      fieldValues: buildFieldValues(formData),
    };
  }

  const result = await CrmLeadService.updateLead({
    leadId,
    organizationId,
    name: parsed.data.name,
    phone: parsed.data.phone ?? null,
    email: parsed.data.email || null,
    source: parsed.data.source,
    estimatedValue: parsed.data.estimatedValue ?? null,
    notes: parsed.data.notes ?? null,
    updatedBy: session.user.id,
  });

  if (!result.success) {
    logger.error("Erro ao atualizar lead", result.error);
    return {
      success: false,
      message: result.error ?? "Erro ao atualizar lead.",
      fieldValues: buildFieldValues(formData),
    };
  }

  revalidateCrmLeads(organizationId, leadId);

  return { success: true, message: "Lead atualizado com sucesso." };
}

export async function deleteLeadAction(
  leadId: string,
): Promise<{ success: boolean; message: string }> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const result = await CrmLeadService.deleteLead({ leadId, organizationId });

  if (!result.success) {
    logger.error("Erro ao excluir lead", result.error);
    return { success: false, message: result.error ?? "Erro ao excluir lead." };
  }

  revalidateCrmLeads(organizationId, leadId);

  return { success: true, message: "Lead excluído com sucesso." };
}

export async function linkLeadToCustomerAction(params: {
  leadId: string;
  customerId: string;
}): Promise<{ success: boolean; message: string }> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const result = await CrmLeadService.linkLeadToCustomer({
    leadId: params.leadId,
    organizationId,
    customerId: params.customerId,
    updatedBy: session.user.id,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error ?? "Erro ao vincular cliente.",
    };
  }

  await CrmActivityService.createActivity({
    leadId: params.leadId,
    organizationId,
    activityType: "anotacao",
    description: `Cliente vinculado ao lead.`,
    metadataJson: { customerId: params.customerId },
    createdBy: session.user.id,
  });

  revalidateCrmLeads(organizationId, params.leadId);

  return { success: true, message: "Cliente vinculado com sucesso." };
}
