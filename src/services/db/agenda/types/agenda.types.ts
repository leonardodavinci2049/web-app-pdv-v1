import "server-only";

import type { RowDataPacket } from "mysql2/promise";

export const AGENDA_TABLES = {
  ENTRY: "agenda_entry",
  NOTIFICATION: "agenda_notification",
} as const;

export const AGENDA_ENTRY_TYPES = [
  "lembrete",
  "tarefa",
  "compromisso",
] as const;

export const AGENDA_ENTRY_STATUSES = [
  "pendente",
  "em_andamento",
  "concluido",
  "cancelado",
  "adiado",
] as const;

export const AGENDA_ENTRY_PRIORITIES = ["baixa", "media", "alta"] as const;

export type AgendaEntryType = (typeof AGENDA_ENTRY_TYPES)[number];
export type AgendaEntryStatus = (typeof AGENDA_ENTRY_STATUSES)[number];
export type AgendaEntryPriority = (typeof AGENDA_ENTRY_PRIORITIES)[number];

export interface AgendaEntryEntity extends RowDataPacket {
  id: string;
  organizationId: string | null;
  userId: string;
  entryType: AgendaEntryType;
  title: string;
  notes: string | null;
  status: AgendaEntryStatus;
  priority: AgendaEntryPriority;
  scheduledAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgendaEntry {
  id: string;
  organizationId: string | null;
  userId: string;
  entryType: AgendaEntryType;
  title: string;
  notes: string | null;
  status: AgendaEntryStatus;
  priority: AgendaEntryPriority;
  scheduledAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgendaNotificationEntity extends RowDataPacket {
  id: string;
  agendaEntryId: string;
  organizationId: string | null;
  userId: string;
  title: string;
  message: string | null;
  notifyAt: Date;
  readAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgendaNotification {
  id: string;
  agendaEntryId: string;
  organizationId: string | null;
  userId: string;
  title: string;
  message: string | null;
  notifyAt: Date;
  readAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface ModifyResponse {
  success: boolean;
  affectedRows: number;
  error: string | null;
}

export class AgendaValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldName: string,
  ) {
    super(message);
    this.name = "AgendaValidationError";
  }
}
