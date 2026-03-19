"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import type {
  AgendaEntryPriority,
  AgendaEntryStatus,
  AgendaEntryType,
} from "@/services/db/agenda";
import {
  AGENDA_ENTRY_PRIORITIES,
  AGENDA_ENTRY_STATUSES,
  AGENDA_ENTRY_TYPES,
  AgendaService,
} from "@/services/db/agenda";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("agendaActions");
const AGENDA_PATH = "/dashboard/agenda/agenda-panel";
type AgendaActionState = Exclude<ActionState, null>;

const agendaEntryFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Informe um título com pelo menos 3 caracteres.")
    .max(120, "Use no máximo 120 caracteres no título."),
  notes: z
    .string()
    .trim()
    .max(1000, "Use no máximo 1000 caracteres nas observações."),
  scheduledAt: z
    .string()
    .trim()
    .min(1, "Informe a data e hora.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Informe uma data e hora válidas.",
    )
    .refine(
      (value) => new Date(value).getTime() >= Date.now() - 60_000,
      "Escolha uma data e hora futura.",
    ),
  entryType: z
    .string()
    .refine(
      (value): value is AgendaEntryType =>
        AGENDA_ENTRY_TYPES.includes(value as AgendaEntryType),
      "Selecione um tipo válido.",
    ),
  status: z
    .string()
    .refine(
      (value): value is AgendaEntryStatus =>
        AGENDA_ENTRY_STATUSES.includes(value as AgendaEntryStatus),
      "Selecione um status válido.",
    ),
  priority: z
    .string()
    .refine(
      (value): value is AgendaEntryPriority =>
        AGENDA_ENTRY_PRIORITIES.includes(value as AgendaEntryPriority),
      "Selecione uma prioridade válida.",
    ),
});

type AgendaEntryFormValues = z.infer<typeof agendaEntryFormSchema>;

function revalidateAgenda(
  userId: string,
  entryId?: string,
  notificationId?: string,
) {
  revalidateTag(CACHE_TAGS.agendaEntries, "seconds");
  revalidateTag(CACHE_TAGS.agendaEntriesByUser(userId), "seconds");
  revalidateTag(CACHE_TAGS.agendaNotifications, "seconds");
  revalidateTag(CACHE_TAGS.agendaNotificationsByUser(userId), "seconds");

  if (entryId) {
    revalidateTag(CACHE_TAGS.agendaEntry(entryId), "seconds");
  }

  if (notificationId) {
    revalidateTag(CACHE_TAGS.agendaNotification(notificationId), "seconds");
  }

  revalidatePath(AGENDA_PATH);
}

function getNotificationMessage(
  entryType: AgendaEntryType,
  title: string,
): string {
  switch (entryType) {
    case "compromisso":
      return `Compromisso agendado: ${title}`;
    case "tarefa":
      return `Tarefa pendente: ${title}`;
    default:
      return `Lembrete programado: ${title}`;
  }
}

async function syncAgendaNotification(params: {
  agendaEntryId: string;
  userId: string;
  organizationId?: string | null;
  entryType: AgendaEntryType;
  title: string;
  scheduledAt: string;
  status: AgendaEntryStatus;
}) {
  const notification = await AgendaService.findAgendaNotificationByEntryId({
    agendaEntryId: params.agendaEntryId,
    userId: params.userId,
  });

  if (!notification.success) {
    return {
      success: false,
      error: notification.error,
      notificationId: undefined,
    };
  }

  const shouldKeepNotification =
    params.status !== "concluido" && params.status !== "cancelado";

  if (!shouldKeepNotification) {
    if (notification.data) {
      const deleted = await AgendaService.deleteAgendaNotification({
        notificationId: notification.data.id,
        userId: params.userId,
      });

      return {
        success: deleted.success,
        error: deleted.error,
        notificationId: notification.data.id,
      };
    }

    return { success: true, error: null, notificationId: undefined };
  }

  if (notification.data) {
    const updated = await AgendaService.updateAgendaNotification({
      notificationId: notification.data.id,
      userId: params.userId,
      title: params.title,
      message: getNotificationMessage(params.entryType, params.title),
      notifyAt: params.scheduledAt,
      readAt: null,
      deliveredAt: null,
    });

    return {
      success: updated.success,
      error: updated.error,
      notificationId: notification.data.id,
    };
  }

  const created = await AgendaService.createAgendaNotification({
    agendaEntryId: params.agendaEntryId,
    organizationId: params.organizationId,
    userId: params.userId,
    title: params.title,
    message: getNotificationMessage(params.entryType, params.title),
    notifyAt: params.scheduledAt,
  });

  return {
    success: created.success,
    error: created.error,
    notificationId: undefined,
  };
}

function getStringField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function buildFieldValues(formData: FormData) {
  return {
    title: getStringField(formData, "title"),
    notes: getStringField(formData, "notes"),
    scheduledAt: getStringField(formData, "scheduledAt"),
    entryType: getStringField(formData, "entryType"),
    status: getStringField(formData, "status"),
    priority: getStringField(formData, "priority"),
  };
}

function validateAgendaEntryForm(
  formData: FormData,
):
  | { success: true; data: AgendaEntryFormValues }
  | { success: false; state: AgendaActionState } {
  const fieldValues = buildFieldValues(formData);
  const result = agendaEntryFormSchema.safeParse(fieldValues);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const flattenedErrors = result.error.flatten().fieldErrors;
  const errors = Object.fromEntries(
    Object.entries(flattenedErrors)
      .filter(([, messages]) => Boolean(messages?.[0]))
      .map(([field, messages]) => [field, messages?.[0] ?? "Campo inválido."]),
  );

  return {
    success: false,
    state: {
      success: false,
      message: "Revise os campos destacados e tente novamente.",
      errors,
      fieldValues,
    },
  };
}

export async function createAgendaEntryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { session } = await getAuthContext();
    const validation = validateAgendaEntryForm(formData);

    if (!validation.success) {
      return validation.state;
    }

    const entryId = randomUUID();
    const { title, notes, scheduledAt, entryType, status, priority } =
      validation.data;

    const created = await AgendaService.createAgendaEntry({
      entryId,
      userId: session.user.id,
      organizationId: session.session?.activeOrganizationId ?? null,
      title,
      notes,
      scheduledAt,
      entryType,
      status,
      priority,
    });

    if (!created.success) {
      return {
        success: false,
        message: created.error ?? "Não foi possível criar o item da agenda.",
        fieldValues: buildFieldValues(formData),
      };
    }

    const notification = await syncAgendaNotification({
      agendaEntryId: entryId,
      userId: session.user.id,
      organizationId: session.session?.activeOrganizationId ?? null,
      entryType,
      title,
      scheduledAt,
      status,
    });

    if (!notification.success) {
      logger.warn(
        "Falha ao sincronizar notificação da agenda",
        notification.error,
      );
    }

    revalidateAgenda(session.user.id, entryId, notification.notificationId);

    return {
      success: true,
      message: "Item da agenda criado com sucesso.",
    };
  } catch (error) {
    logger.error("Erro ao criar item da agenda:", error);
    return {
      success: false,
      message: "Erro ao criar item da agenda. Tente novamente.",
      fieldValues: buildFieldValues(formData),
    };
  }
}

export async function updateAgendaEntryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { session } = await getAuthContext();
    const validation = validateAgendaEntryForm(formData);

    if (!validation.success) {
      return {
        success: false,
        message: validation.state.message,
        errors: validation.state.errors,
        fieldValues: {
          ...validation.state.fieldValues,
          entryId: getStringField(formData, "entryId"),
        },
      };
    }

    const entryId = getStringField(formData, "entryId");
    const { title, notes, scheduledAt, entryType, status, priority } =
      validation.data;
    const completedAt =
      status === "concluido" ? new Date().toISOString() : null;

    const updated = await AgendaService.updateAgendaEntry({
      entryId,
      userId: session.user.id,
      organizationId: session.session?.activeOrganizationId ?? null,
      title,
      notes,
      scheduledAt,
      entryType,
      status,
      priority,
      completedAt,
    });

    if (!updated.success) {
      return {
        success: false,
        message:
          updated.error ?? "Não foi possível atualizar o item da agenda.",
        fieldValues: {
          ...buildFieldValues(formData),
          entryId,
        },
      };
    }

    const notification = await syncAgendaNotification({
      agendaEntryId: entryId,
      userId: session.user.id,
      organizationId: session.session?.activeOrganizationId ?? null,
      entryType,
      title,
      scheduledAt,
      status,
    });

    if (!notification.success) {
      logger.warn(
        "Falha ao atualizar notificação da agenda",
        notification.error,
      );
    }

    revalidateAgenda(session.user.id, entryId, notification.notificationId);

    return {
      success: true,
      message: "Item da agenda atualizado com sucesso.",
    };
  } catch (error) {
    logger.error("Erro ao atualizar item da agenda:", error);
    return {
      success: false,
      message: "Erro ao atualizar item da agenda. Tente novamente.",
      fieldValues: buildFieldValues(formData),
    };
  }
}

export async function setAgendaEntryStatusAction(params: {
  entryId: string;
  status: AgendaEntryStatus;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { session } = await getAuthContext();

    const current = await AgendaService.findAgendaEntryById({
      entryId: params.entryId,
      userId: session.user.id,
      organizationId: session.session?.activeOrganizationId ?? null,
    });

    if (!current.success || !current.data) {
      return {
        success: false,
        message: current.error ?? "Item da agenda não encontrado.",
      };
    }

    const completedAt =
      params.status === "concluido" ? new Date().toISOString() : null;

    const updated = await AgendaService.updateAgendaEntry({
      entryId: params.entryId,
      userId: session.user.id,
      organizationId: session.session?.activeOrganizationId ?? null,
      status: params.status,
      completedAt,
    });

    if (!updated.success) {
      return {
        success: false,
        message: updated.error ?? "Não foi possível atualizar o status.",
      };
    }

    const notification = await syncAgendaNotification({
      agendaEntryId: current.data.id,
      userId: session.user.id,
      organizationId: session.session?.activeOrganizationId ?? null,
      entryType: current.data.entryType,
      title: current.data.title,
      scheduledAt: current.data.scheduledAt.toISOString(),
      status: params.status,
    });

    if (!notification.success) {
      logger.warn("Falha ao atualizar alerta da agenda", notification.error);
    }

    revalidateAgenda(
      session.user.id,
      current.data.id,
      notification.notificationId,
    );

    return {
      success: true,
      message: "Status da agenda atualizado.",
    };
  } catch (error) {
    logger.error("Erro ao atualizar status da agenda:", error);
    return {
      success: false,
      message: "Erro ao atualizar status da agenda.",
    };
  }
}

export async function deleteAgendaEntryAction(
  entryId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { session } = await getAuthContext();

    const notification = await AgendaService.findAgendaNotificationByEntryId({
      agendaEntryId: entryId,
      userId: session.user.id,
    });

    if (notification.data) {
      await AgendaService.deleteAgendaNotification({
        notificationId: notification.data.id,
        userId: session.user.id,
      });
    }

    const deleted = await AgendaService.deleteAgendaEntry({
      entryId,
      userId: session.user.id,
      organizationId: session.session?.activeOrganizationId ?? null,
    });

    if (!deleted.success) {
      return {
        success: false,
        message: deleted.error ?? "Não foi possível excluir o item da agenda.",
      };
    }

    revalidateAgenda(session.user.id, entryId, notification.data?.id);

    return {
      success: true,
      message: "Item da agenda removido com sucesso.",
    };
  } catch (error) {
    logger.error("Erro ao excluir item da agenda:", error);
    return {
      success: false,
      message: "Erro ao excluir item da agenda.",
    };
  }
}

export async function markAgendaNotificationAsReadAction(
  notificationId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { session } = await getAuthContext();

    const updated = await AgendaService.markAgendaNotificationAsRead({
      notificationId,
      userId: session.user.id,
    });

    if (!updated.success) {
      return {
        success: false,
        message: updated.error ?? "Não foi possível atualizar o alerta.",
      };
    }

    revalidateAgenda(session.user.id, undefined, notificationId);

    return {
      success: true,
      message: "Alerta marcado como lido.",
    };
  } catch (error) {
    logger.error("Erro ao marcar alerta como lido:", error);
    return {
      success: false,
      message: "Erro ao atualizar o alerta.",
    };
  }
}
