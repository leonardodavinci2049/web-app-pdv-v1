"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { CrmLeadService } from "@/services/db/crm-lead";
import {
  CRM_TASK_PRIORITIES,
  type CrmTaskPriority,
  CrmTaskService,
  type CrmTaskStatus,
} from "@/services/db/crm-task";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("crmTaskActions");

const taskFormSchema = z.object({
  leadId: z.string().trim().min(1, "Lead é obrigatório."),
  title: z
    .string()
    .trim()
    .min(2, "Título deve ter pelo menos 2 caracteres.")
    .max(255, "Título muito longo."),
  description: z.string().trim().max(5000, "Descrição muito longa.").optional(),
  dueDate: z
    .string()
    .trim()
    .min(1, "Data de vencimento é obrigatória.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Data inválida.",
    ),
  priority: z
    .string()
    .refine(
      (v): v is CrmTaskPriority =>
        CRM_TASK_PRIORITIES.includes(v as CrmTaskPriority),
      "Prioridade inválida.",
    )
    .optional()
    .default("medium"),
});

function revalidateCrmTasks(userId: string, leadId: string, taskId?: string) {
  revalidateTag(CACHE_TAGS.crmTasks, "seconds");
  revalidateTag(CACHE_TAGS.crmTasksByUser(userId), "seconds");
  revalidateTag(CACHE_TAGS.crmTasksByLead(leadId), "seconds");
  revalidateTag(CACHE_TAGS.crmDashboard, "seconds");
  if (taskId) {
    revalidateTag(CACHE_TAGS.crmTask(taskId), "seconds");
  }
}

export async function createTaskAction(
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
    title: (formData.get("title") as string) ?? "",
    description: (formData.get("description") as string) ?? "",
    dueDate: (formData.get("dueDate") as string) ?? "",
    priority: (formData.get("priority") as string) ?? "medium",
  };

  const parsed = taskFormSchema.safeParse(rawData);
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

  const result = await CrmTaskService.createTask({
    leadId: parsed.data.leadId,
    organizationId,
    assignedUserId: session.user.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    dueDate: parsed.data.dueDate,
    priority: parsed.data.priority as CrmTaskPriority,
    createdBy: session.user.id,
  });

  if (!result.success) {
    logger.error("Erro ao criar tarefa", result.error);
    return {
      success: false,
      message: result.error ?? "Erro ao criar tarefa.",
    };
  }

  await CrmLeadService.updateLead({
    leadId: parsed.data.leadId,
    organizationId,
    nextFollowUpAt: new Date(parsed.data.dueDate),
    updatedBy: session.user.id,
  });

  revalidateCrmTasks(session.user.id, parsed.data.leadId, result.id);

  return {
    success: true,
    message: "Tarefa criada com sucesso.",
    data: { id: result.id ?? "" },
  };
}

export async function completeTaskAction(params: {
  taskId: string;
  leadId: string;
}): Promise<{ success: boolean; message: string }> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const result = await CrmTaskService.updateTaskStatus({
    taskId: params.taskId,
    organizationId,
    status: "completed" as CrmTaskStatus,
  });

  if (!result.success) {
    logger.error("Erro ao concluir tarefa", result.error);
    return {
      success: false,
      message: result.error ?? "Erro ao concluir tarefa.",
    };
  }

  revalidateCrmTasks(session.user.id, params.leadId, params.taskId);

  return { success: true, message: "Tarefa concluída." };
}

export async function cancelTaskAction(params: {
  taskId: string;
  leadId: string;
}): Promise<{ success: boolean; message: string }> {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return { success: false, message: "Organização não encontrada." };
  }

  const result = await CrmTaskService.updateTaskStatus({
    taskId: params.taskId,
    organizationId,
    status: "cancelled" as CrmTaskStatus,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error ?? "Erro ao cancelar tarefa.",
    };
  }

  revalidateCrmTasks(session.user.id, params.leadId, params.taskId);

  return { success: true, message: "Tarefa cancelada." };
}
