import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/database/dbConnection";

import {
  AGENDA_ENTRY_PRIORITIES,
  AGENDA_ENTRY_STATUSES,
  AGENDA_ENTRY_TYPES,
  AGENDA_TABLES,
  type AgendaEntry,
  type AgendaEntryEntity,
  type AgendaEntryPriority,
  type AgendaEntryStatus,
  type AgendaEntryType,
  type AgendaNotification,
  type AgendaNotificationEntity,
  AgendaValidationError,
  type ModifyResponse,
  type ServiceResponse,
} from "./types/agenda.types";

const IdSchema = z
  .string()
  .trim()
  .min(1, "ID é obrigatório")
  .max(128, "ID muito longo");

const OptionalOrganizationIdSchema = z
  .string()
  .trim()
  .min(1, "organizationId é obrigatório")
  .max(128, "organizationId muito longo")
  .nullable()
  .optional();

const TitleSchema = z
  .string()
  .trim()
  .min(1, "Título é obrigatório")
  .max(160, "Título muito longo");

const NotesSchema = z
  .string()
  .trim()
  .max(4000, "Observação muito longa")
  .nullable()
  .optional();

const MessageSchema = z
  .string()
  .trim()
  .max(255, "Mensagem muito longa")
  .nullable()
  .optional();

const EntryTypeSchema = z.enum(AGENDA_ENTRY_TYPES);
const EntryStatusSchema = z.enum(AGENDA_ENTRY_STATUSES);
const EntryPrioritySchema = z.enum(AGENDA_ENTRY_PRIORITIES);

const LimitSchema = z
  .number()
  .int()
  .min(1, "Limite mínimo é 1")
  .max(200, "Limite máximo é 200")
  .optional();

const BooleanSchema = z.boolean().optional();

function validateId(id: string, fieldName: string): string {
  const result = IdSchema.safeParse(id);

  if (!result.success) {
    throw new AgendaValidationError(
      `${fieldName}: ${result.error.issues[0].message}`,
      fieldName,
    );
  }

  return result.data;
}

function validateOrganizationId(organizationId?: string | null): string | null {
  const normalizedValue = organizationId ?? null;
  const result = OptionalOrganizationIdSchema.safeParse(normalizedValue);

  if (!result.success) {
    throw new AgendaValidationError(
      `organizationId: ${result.error.issues[0].message}`,
      "organizationId",
    );
  }

  return result.data ?? null;
}

function validateTitle(title: string): string {
  const result = TitleSchema.safeParse(title);

  if (!result.success) {
    throw new AgendaValidationError(
      `title: ${result.error.issues[0].message}`,
      "title",
    );
  }

  return result.data;
}

function validateNotes(notes?: string | null): string | null {
  const normalizedValue = notes?.trim() ? notes.trim() : null;
  const result = NotesSchema.safeParse(normalizedValue);

  if (!result.success) {
    throw new AgendaValidationError(
      `notes: ${result.error.issues[0].message}`,
      "notes",
    );
  }

  return result.data ?? null;
}

function validateMessage(message?: string | null): string | null {
  const normalizedValue = message?.trim() ? message.trim() : null;
  const result = MessageSchema.safeParse(normalizedValue);

  if (!result.success) {
    throw new AgendaValidationError(
      `message: ${result.error.issues[0].message}`,
      "message",
    );
  }

  return result.data ?? null;
}

function validateEntryType(entryType: AgendaEntryType): AgendaEntryType {
  const result = EntryTypeSchema.safeParse(entryType);

  if (!result.success) {
    throw new AgendaValidationError(
      `entryType: ${result.error.issues[0].message}`,
      "entryType",
    );
  }

  return result.data;
}

function validateEntryStatus(status: AgendaEntryStatus): AgendaEntryStatus {
  const result = EntryStatusSchema.safeParse(status);

  if (!result.success) {
    throw new AgendaValidationError(
      `status: ${result.error.issues[0].message}`,
      "status",
    );
  }

  return result.data;
}

function validateEntryPriority(
  priority: AgendaEntryPriority,
): AgendaEntryPriority {
  const result = EntryPrioritySchema.safeParse(priority);

  if (!result.success) {
    throw new AgendaValidationError(
      `priority: ${result.error.issues[0].message}`,
      "priority",
    );
  }

  return result.data;
}

function validateLimit(limit?: number): number {
  const result = LimitSchema.safeParse(limit);

  if (!result.success) {
    throw new AgendaValidationError(
      `limit: ${result.error.issues[0].message}`,
      "limit",
    );
  }

  return result.data ?? 100;
}

function validateBoolean(
  value: boolean | undefined,
  fieldName: string,
): boolean {
  const result = BooleanSchema.safeParse(value);

  if (!result.success) {
    throw new AgendaValidationError(
      `${fieldName}: ${result.error.issues[0].message}`,
      fieldName,
    );
  }

  return result.data ?? false;
}

function validateDateInput(
  value: Date | string,
  fieldName: string,
  options?: { allowPast?: boolean },
): Date {
  const result = z.coerce.date().safeParse(value);

  if (!result.success || Number.isNaN(result.data.getTime())) {
    throw new AgendaValidationError(`${fieldName}: data inválida`, fieldName);
  }

  if (!options?.allowPast && result.data.getTime() < Date.now()) {
    throw new AgendaValidationError(
      `${fieldName}: não é permitido usar data passada`,
      fieldName,
    );
  }

  return result.data;
}

function validateOptionalDateInput(
  value: Date | string | null | undefined,
  fieldName: string,
  options?: { allowPast?: boolean },
): Date | null {
  if (value === undefined || value === null) {
    return null;
  }

  return validateDateInput(value, fieldName, options);
}

function mapAgendaEntryEntityToDto(entity: AgendaEntryEntity): AgendaEntry {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    userId: entity.userId,
    entryType: entity.entryType,
    title: entity.title,
    notes: entity.notes,
    status: entity.status,
    priority: entity.priority,
    scheduledAt: entity.scheduledAt,
    completedAt: entity.completedAt,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

function mapAgendaNotificationEntityToDto(
  entity: AgendaNotificationEntity,
): AgendaNotification {
  return {
    id: entity.id,
    agendaEntryId: entity.agendaEntryId,
    organizationId: entity.organizationId,
    userId: entity.userId,
    title: entity.title,
    message: entity.message,
    notifyAt: entity.notifyAt,
    readAt: entity.readAt,
    deliveredAt: entity.deliveredAt,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[AgendaService] Erro em ${operation}:`, error);

  if (error instanceof AgendaValidationError) {
    return { success: false, data: null, error: error.message };
  }

  if (error instanceof ErroConexaoBancoDados) {
    return {
      success: false,
      data: null,
      error: "Erro de conexão com o banco de dados",
    };
  }

  if (error instanceof ErroExecucaoConsulta) {
    return {
      success: false,
      data: null,
      error: "Erro ao processar a consulta no banco de dados",
    };
  }

  return {
    success: false,
    data: null,
    error: "Ocorreu um erro interno inesperado",
  };
}

function handleModifyError(error: unknown, operation: string): ModifyResponse {
  console.error(`[AgendaService] Erro em ${operation}:`, error);

  if (error instanceof AgendaValidationError) {
    return { success: false, affectedRows: 0, error: error.message };
  }

  if (error instanceof ErroConexaoBancoDados) {
    return {
      success: false,
      affectedRows: 0,
      error: "Erro de conexão com o banco de dados",
    };
  }

  if (error instanceof ErroExecucaoConsulta) {
    return {
      success: false,
      affectedRows: 0,
      error: "Erro ao processar a consulta no banco de dados",
    };
  }

  return {
    success: false,
    affectedRows: 0,
    error: "Erro ao realizar operação de modificação",
  };
}

async function findAgendaEntryById(params: {
  entryId: string;
  userId: string;
  organizationId?: string | null;
}): Promise<ServiceResponse<AgendaEntry>> {
  try {
    const entryId = validateId(params.entryId, "entryId");
    const userId = validateId(params.userId, "userId");
    const organizationId = validateOrganizationId(params.organizationId);

    const query = `
      SELECT
        id, organizationId, userId, entryType, title,
        notes, status, priority, scheduledAt,
        completedAt, createdAt, updatedAt
      FROM ${AGENDA_TABLES.ENTRY}
      WHERE id = ?
        AND userId = ?
        AND (? IS NULL OR organizationId = ?)
      LIMIT 1
    `;

    const results = await dbService.selectExecute<AgendaEntryEntity>(query, [
      entryId,
      userId,
      organizationId,
      organizationId,
    ]);

    if (results.length === 0) {
      return { success: true, data: null, error: null };
    }

    return {
      success: true,
      data: mapAgendaEntryEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<AgendaEntry>(error, "findAgendaEntryById");
  }
}

async function findAgendaEntriesByUser(params: {
  userId: string;
  organizationId?: string | null;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: AgendaEntryStatus;
  priority?: AgendaEntryPriority;
  entryType?: AgendaEntryType;
  limit?: number;
}): Promise<ServiceResponse<AgendaEntry[]>> {
  try {
    const userId = validateId(params.userId, "userId");
    const organizationId = validateOrganizationId(params.organizationId);
    const limit = validateLimit(params.limit);

    const conditions = ["userId = ?"];
    const queryParams: Array<string | number | Date | null> = [userId];

    if (organizationId) {
      conditions.push("organizationId = ?");
      queryParams.push(organizationId);
    }

    if (params.startDate) {
      conditions.push("scheduledAt >= ?");
      queryParams.push(
        validateDateInput(params.startDate, "startDate", { allowPast: true }),
      );
    }

    if (params.endDate) {
      conditions.push("scheduledAt <= ?");
      queryParams.push(
        validateDateInput(params.endDate, "endDate", { allowPast: true }),
      );
    }

    if (params.status) {
      conditions.push("status = ?");
      queryParams.push(validateEntryStatus(params.status));
    }

    if (params.priority) {
      conditions.push("priority = ?");
      queryParams.push(validateEntryPriority(params.priority));
    }

    if (params.entryType) {
      conditions.push("entryType = ?");
      queryParams.push(validateEntryType(params.entryType));
    }

    queryParams.push(limit);

    const query = `
      SELECT
        id, organizationId, userId, entryType, title,
        notes, status, priority, scheduledAt,
        completedAt, createdAt, updatedAt
      FROM ${AGENDA_TABLES.ENTRY}
      WHERE ${conditions.join(" AND ")}
      ORDER BY scheduledAt ASC
      LIMIT ?
    `;

    const results = await dbService.selectExecute<AgendaEntryEntity>(
      query,
      queryParams,
    );

    return {
      success: true,
      data: results.map(mapAgendaEntryEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<AgendaEntry[]>(error, "findAgendaEntriesByUser");
  }
}

async function createAgendaEntry(params: {
  entryId?: string;
  userId: string;
  organizationId?: string | null;
  entryType: AgendaEntryType;
  title: string;
  notes?: string | null;
  status?: AgendaEntryStatus;
  priority?: AgendaEntryPriority;
  scheduledAt: Date | string;
}): Promise<ModifyResponse> {
  try {
    const id = params.entryId
      ? validateId(params.entryId, "entryId")
      : randomUUID();
    const userId = validateId(params.userId, "userId");
    const organizationId = validateOrganizationId(params.organizationId);
    const entryType = validateEntryType(params.entryType);
    const title = validateTitle(params.title);
    const notes = validateNotes(params.notes);
    const status = validateEntryStatus(params.status ?? "pendente");
    const priority = validateEntryPriority(params.priority ?? "media");
    const scheduledAt = validateDateInput(params.scheduledAt, "scheduledAt");

    const query = `
      INSERT INTO ${AGENDA_TABLES.ENTRY} (
        id, organizationId, userId, entryType, title,
        notes, status, priority, scheduledAt,
        completedAt, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NOW(), NOW())
    `;

    const result = await dbService.modifyExecute(query, [
      id,
      organizationId,
      userId,
      entryType,
      title,
      notes,
      status,
      priority,
      scheduledAt,
    ]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error: result.affectedRows === 0 ? "Item da agenda não criado" : null,
    };
  } catch (error) {
    return handleModifyError(error, "createAgendaEntry");
  }
}

async function updateAgendaEntry(params: {
  entryId: string;
  userId: string;
  organizationId?: string | null;
  entryType?: AgendaEntryType;
  title?: string;
  notes?: string | null;
  status?: AgendaEntryStatus;
  priority?: AgendaEntryPriority;
  scheduledAt?: Date | string;
  completedAt?: Date | string | null;
}): Promise<ModifyResponse> {
  try {
    const entryId = validateId(params.entryId, "entryId");
    const userId = validateId(params.userId, "userId");
    const organizationId = validateOrganizationId(params.organizationId);

    const setClauses: string[] = [];
    const queryParams: Array<string | Date | null> = [];

    if (params.entryType !== undefined) {
      setClauses.push("entryType = ?");
      queryParams.push(validateEntryType(params.entryType));
    }

    if (params.title !== undefined) {
      setClauses.push("title = ?");
      queryParams.push(validateTitle(params.title));
    }

    if (params.notes !== undefined) {
      setClauses.push("notes = ?");
      queryParams.push(validateNotes(params.notes));
    }

    if (params.status !== undefined) {
      setClauses.push("status = ?");
      queryParams.push(validateEntryStatus(params.status));
    }

    if (params.priority !== undefined) {
      setClauses.push("priority = ?");
      queryParams.push(validateEntryPriority(params.priority));
    }

    if (params.scheduledAt !== undefined) {
      setClauses.push("scheduledAt = ?");
      queryParams.push(validateDateInput(params.scheduledAt, "scheduledAt"));
    }

    if (params.completedAt !== undefined) {
      setClauses.push("completedAt = ?");
      queryParams.push(
        validateOptionalDateInput(params.completedAt, "completedAt", {
          allowPast: true,
        }),
      );
    }

    if (setClauses.length === 0) {
      throw new AgendaValidationError(
        "Nenhum campo informado para atualização",
        "updateAgendaEntry",
      );
    }

    setClauses.push("updatedAt = NOW()");

    const organizationFilter = organizationId ? " AND organizationId = ?" : "";

    queryParams.push(entryId, userId);

    if (organizationId) {
      queryParams.push(organizationId);
    }

    const query = `
      UPDATE ${AGENDA_TABLES.ENTRY}
      SET ${setClauses.join(", ")}
      WHERE id = ?
        AND userId = ?${organizationFilter}
    `;

    const result = await dbService.modifyExecute(query, queryParams);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Item da agenda não encontrado para atualização"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "updateAgendaEntry");
  }
}

async function deleteAgendaEntry(params: {
  entryId: string;
  userId: string;
  organizationId?: string | null;
}): Promise<ModifyResponse> {
  try {
    const entryId = validateId(params.entryId, "entryId");
    const userId = validateId(params.userId, "userId");
    const organizationId = validateOrganizationId(params.organizationId);

    const query = organizationId
      ? `
        DELETE FROM ${AGENDA_TABLES.ENTRY}
        WHERE id = ? AND userId = ? AND organizationId = ?
      `
      : `
        DELETE FROM ${AGENDA_TABLES.ENTRY}
        WHERE id = ? AND userId = ?
      `;

    const result = await dbService.modifyExecute(
      query,
      organizationId ? [entryId, userId, organizationId] : [entryId, userId],
    );

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Item da agenda não encontrado para exclusão"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "deleteAgendaEntry");
  }
}

async function findAgendaNotificationsByUser(params: {
  userId: string;
  organizationId?: string | null;
  unreadOnly?: boolean;
  dueBefore?: Date | string;
  limit?: number;
}): Promise<ServiceResponse<AgendaNotification[]>> {
  try {
    const userId = validateId(params.userId, "userId");
    const organizationId = validateOrganizationId(params.organizationId);
    const unreadOnly = validateBoolean(params.unreadOnly, "unreadOnly");
    const limit = validateLimit(params.limit);

    const conditions = ["userId = ?"];
    const queryParams: Array<string | number | Date> = [userId];

    if (organizationId) {
      conditions.push("organizationId = ?");
      queryParams.push(organizationId);
    }

    if (unreadOnly) {
      conditions.push("readAt IS NULL");
    }

    if (params.dueBefore) {
      conditions.push("notifyAt <= ?");
      queryParams.push(
        validateDateInput(params.dueBefore, "dueBefore", { allowPast: true }),
      );
    }

    queryParams.push(limit);

    const query = `
      SELECT
        id, agendaEntryId, organizationId, userId,
        title, message, notifyAt, readAt,
        deliveredAt, createdAt, updatedAt
      FROM ${AGENDA_TABLES.NOTIFICATION}
      WHERE ${conditions.join(" AND ")}
      ORDER BY notifyAt ASC
      LIMIT ?
    `;

    const results = await dbService.selectExecute<AgendaNotificationEntity>(
      query,
      queryParams,
    );

    return {
      success: true,
      data: results.map(mapAgendaNotificationEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<AgendaNotification[]>(
      error,
      "findAgendaNotificationsByUser",
    );
  }
}

async function findAgendaNotificationByEntryId(params: {
  agendaEntryId: string;
  userId: string;
}): Promise<ServiceResponse<AgendaNotification>> {
  try {
    const agendaEntryId = validateId(params.agendaEntryId, "agendaEntryId");
    const userId = validateId(params.userId, "userId");

    const query = `
      SELECT
        id, agendaEntryId, organizationId, userId,
        title, message, notifyAt, readAt,
        deliveredAt, createdAt, updatedAt
      FROM ${AGENDA_TABLES.NOTIFICATION}
      WHERE agendaEntryId = ? AND userId = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<AgendaNotificationEntity>(
      query,
      [agendaEntryId, userId],
    );

    if (results.length === 0) {
      return { success: true, data: null, error: null };
    }

    return {
      success: true,
      data: mapAgendaNotificationEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<AgendaNotification>(
      error,
      "findAgendaNotificationByEntryId",
    );
  }
}

async function createAgendaNotification(params: {
  agendaEntryId: string;
  userId: string;
  organizationId?: string | null;
  title: string;
  message?: string | null;
  notifyAt: Date | string;
}): Promise<ModifyResponse> {
  try {
    const id = randomUUID();
    const agendaEntryId = validateId(params.agendaEntryId, "agendaEntryId");
    const userId = validateId(params.userId, "userId");
    const organizationId = validateOrganizationId(params.organizationId);
    const title = validateTitle(params.title);
    const message = validateMessage(params.message);
    const notifyAt = validateDateInput(params.notifyAt, "notifyAt");

    const query = `
      INSERT INTO ${AGENDA_TABLES.NOTIFICATION} (
        id, agendaEntryId, organizationId, userId,
        title, message, notifyAt, readAt,
        deliveredAt, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NOW(), NOW())
    `;

    const result = await dbService.modifyExecute(query, [
      id,
      agendaEntryId,
      organizationId,
      userId,
      title,
      message,
      notifyAt,
    ]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error: result.affectedRows === 0 ? "Notificação não criada" : null,
    };
  } catch (error) {
    return handleModifyError(error, "createAgendaNotification");
  }
}

async function updateAgendaNotification(params: {
  notificationId: string;
  userId: string;
  title?: string;
  message?: string | null;
  notifyAt?: Date | string;
  readAt?: Date | string | null;
  deliveredAt?: Date | string | null;
}): Promise<ModifyResponse> {
  try {
    const notificationId = validateId(params.notificationId, "notificationId");
    const userId = validateId(params.userId, "userId");

    const setClauses: string[] = [];
    const queryParams: Array<string | Date | null> = [];

    if (params.title !== undefined) {
      setClauses.push("title = ?");
      queryParams.push(validateTitle(params.title));
    }

    if (params.message !== undefined) {
      setClauses.push("message = ?");
      queryParams.push(validateMessage(params.message));
    }

    if (params.notifyAt !== undefined) {
      setClauses.push("notifyAt = ?");
      queryParams.push(
        validateDateInput(params.notifyAt, "notifyAt", { allowPast: true }),
      );
    }

    if (params.readAt !== undefined) {
      setClauses.push("readAt = ?");
      queryParams.push(
        validateOptionalDateInput(params.readAt, "readAt", { allowPast: true }),
      );
    }

    if (params.deliveredAt !== undefined) {
      setClauses.push("deliveredAt = ?");
      queryParams.push(
        validateOptionalDateInput(params.deliveredAt, "deliveredAt", {
          allowPast: true,
        }),
      );
    }

    if (setClauses.length === 0) {
      throw new AgendaValidationError(
        "Nenhum campo informado para atualização da notificação",
        "updateAgendaNotification",
      );
    }

    setClauses.push("updatedAt = NOW()");
    queryParams.push(notificationId, userId);

    const query = `
      UPDATE ${AGENDA_TABLES.NOTIFICATION}
      SET ${setClauses.join(", ")}
      WHERE id = ? AND userId = ?
    `;

    const result = await dbService.modifyExecute(query, queryParams);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Notificação não encontrada para atualização"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "updateAgendaNotification");
  }
}

async function markAgendaNotificationAsRead(params: {
  notificationId: string;
  userId: string;
  readAt?: Date | string;
}): Promise<ModifyResponse> {
  try {
    const notificationId = validateId(params.notificationId, "notificationId");
    const userId = validateId(params.userId, "userId");
    const readAt =
      params.readAt !== undefined
        ? validateDateInput(params.readAt, "readAt", { allowPast: true })
        : new Date();

    const query = `
      UPDATE ${AGENDA_TABLES.NOTIFICATION}
      SET readAt = ?, updatedAt = NOW()
      WHERE id = ? AND userId = ?
    `;

    const result = await dbService.modifyExecute(query, [
      readAt,
      notificationId,
      userId,
    ]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Notificação não encontrada para atualização"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "markAgendaNotificationAsRead");
  }
}

async function deleteAgendaNotification(params: {
  notificationId: string;
  userId: string;
}): Promise<ModifyResponse> {
  try {
    const notificationId = validateId(params.notificationId, "notificationId");
    const userId = validateId(params.userId, "userId");

    const query = `
      DELETE FROM ${AGENDA_TABLES.NOTIFICATION}
      WHERE id = ? AND userId = ?
    `;

    const result = await dbService.modifyExecute(query, [
      notificationId,
      userId,
    ]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Notificação não encontrada para exclusão"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "deleteAgendaNotification");
  }
}

export const AgendaService = {
  findAgendaEntryById,
  findAgendaEntriesByUser,
  createAgendaEntry,
  updateAgendaEntry,
  deleteAgendaEntry,
  findAgendaNotificationsByUser,
  findAgendaNotificationByEntryId,
  createAgendaNotification,
  updateAgendaNotification,
  markAgendaNotificationAsRead,
  deleteAgendaNotification,
} as const;

export default AgendaService;

export type {
  AgendaEntry,
  AgendaEntryPriority,
  AgendaEntryStatus,
  AgendaEntryType,
  AgendaNotification,
  ModifyResponse,
  ServiceResponse,
};
