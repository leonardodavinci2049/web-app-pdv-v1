"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { CrmActivityService } from "@/services/db/crm-activity";
import { CrmLeadService } from "@/services/db/crm-lead";
import { CrmLeadStageHistoryService } from "@/services/db/crm-lead-stage-history";

const logger = createLogger("crmPipelineActions");
const CRM_PATH = "/dashboard/crm";

function revalidateCrmPipeline(orgId: string, leadId: string) {
  revalidateTag(CACHE_TAGS.crmLeads, "seconds");
  revalidateTag(CACHE_TAGS.crmLeadsByOrg(orgId), "seconds");
  revalidateTag(CACHE_TAGS.crmPipeline, "seconds");
  revalidateTag(CACHE_TAGS.crmDashboard, "seconds");
  revalidateTag(CACHE_TAGS.crmLead(leadId), "seconds");
  revalidateTag(CACHE_TAGS.crmLeadStageHistory(leadId), "seconds");
  revalidateTag(CACHE_TAGS.crmActivitiesByLead(leadId), "seconds");
  revalidatePath(CRM_PATH);
}

export async function moveLeadStageAction(params: {
  leadId: string;
  fromStageKey: string;
  toStageKey: string;
  notes?: string;
}): Promise<{ success: boolean; message: string }> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const stageResult = await CrmLeadService.updateLeadStage({
    leadId: params.leadId,
    organizationId,
    newStageKey: params.toStageKey,
    updatedBy: session.user.id,
  });

  if (!stageResult.success) {
    logger.error("Erro ao mover lead de etapa", stageResult.error);
    return {
      success: false,
      message: stageResult.error ?? "Erro ao mover lead de etapa.",
    };
  }

  await CrmLeadStageHistoryService.createStageTransition({
    leadId: params.leadId,
    fromStageKey: params.fromStageKey,
    toStageKey: params.toStageKey,
    changedBy: session.user.id,
    notes: params.notes ?? null,
  });

  await CrmActivityService.createActivity({
    leadId: params.leadId,
    organizationId,
    activityType: "mudanca_etapa",
    description: `Etapa alterada de "${params.fromStageKey}" para "${params.toStageKey}".`,
    metadataJson: {
      fromStageKey: params.fromStageKey,
      toStageKey: params.toStageKey,
    },
    createdBy: session.user.id,
  });

  if (params.toStageKey === "won") {
    await CrmLeadService.updateLeadStatus({
      leadId: params.leadId,
      organizationId,
      status: "won",
      updatedBy: session.user.id,
    });
  }

  if (params.toStageKey === "lost") {
    await CrmLeadService.updateLeadStatus({
      leadId: params.leadId,
      organizationId,
      status: "lost",
      lostReason: params.notes ?? null,
      updatedBy: session.user.id,
    });
  }

  revalidateCrmPipeline(organizationId, params.leadId);

  return { success: true, message: "Lead movido com sucesso." };
}

export async function markLeadAsWonAction(params: {
  leadId: string;
}): Promise<{ success: boolean; message: string }> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const lead = await CrmLeadService.findLeadById({
    leadId: params.leadId,
    organizationId,
  });
  if (!lead.data) {
    return { success: false, message: "Lead não encontrado." };
  }

  const previousStage = lead.data.currentStageKey;

  await CrmLeadService.updateLeadStage({
    leadId: params.leadId,
    organizationId,
    newStageKey: "won",
    updatedBy: session.user.id,
  });

  await CrmLeadService.updateLeadStatus({
    leadId: params.leadId,
    organizationId,
    status: "won",
    updatedBy: session.user.id,
  });

  await CrmLeadStageHistoryService.createStageTransition({
    leadId: params.leadId,
    fromStageKey: previousStage,
    toStageKey: "won",
    changedBy: session.user.id,
    notes: "Marcado como ganho",
  });

  await CrmActivityService.createActivity({
    leadId: params.leadId,
    organizationId,
    activityType: "mudanca_etapa",
    description: "Lead marcado como ganho.",
    createdBy: session.user.id,
  });

  revalidateCrmPipeline(organizationId, params.leadId);

  return { success: true, message: "Lead marcado como ganho." };
}

export async function markLeadAsLostAction(params: {
  leadId: string;
  lostReason?: string;
}): Promise<{ success: boolean; message: string }> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const lead = await CrmLeadService.findLeadById({
    leadId: params.leadId,
    organizationId,
  });
  if (!lead.data) {
    return { success: false, message: "Lead não encontrado." };
  }

  const previousStage = lead.data.currentStageKey;

  await CrmLeadService.updateLeadStage({
    leadId: params.leadId,
    organizationId,
    newStageKey: "lost",
    updatedBy: session.user.id,
  });

  await CrmLeadService.updateLeadStatus({
    leadId: params.leadId,
    organizationId,
    status: "lost",
    lostReason: params.lostReason ?? null,
    updatedBy: session.user.id,
  });

  await CrmLeadStageHistoryService.createStageTransition({
    leadId: params.leadId,
    fromStageKey: previousStage,
    toStageKey: "lost",
    changedBy: session.user.id,
    notes: params.lostReason ?? "Marcado como perdido",
  });

  await CrmActivityService.createActivity({
    leadId: params.leadId,
    organizationId,
    activityType: "mudanca_etapa",
    description: `Lead marcado como perdido. Motivo: ${params.lostReason ?? "Não informado"}.`,
    createdBy: session.user.id,
  });

  revalidateCrmPipeline(organizationId, params.leadId);

  return { success: true, message: "Lead marcado como perdido." };
}
