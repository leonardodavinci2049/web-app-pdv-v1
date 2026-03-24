import "server-only";

import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/database/dbConnection";

import {
  CRM_LEAD_SOURCES,
  CRM_LEAD_STATUSES,
  CRM_LEAD_TABLES,
  type CrmLead,
  type CrmLeadEntity,
  type CrmLeadStatus,
  type CrmLeadSummary,
  CrmLeadValidationError,
  type ModifyResponse,
  type ServiceResponse,
} from "./types/crm-lead.types";

const IdSchema = z.string().trim().min(1).max(128);
const NameSchema = z.string().trim().min(1).max(255);
const PhoneSchema = z.string().trim().max(30).nullable().optional();
const EmailSchema = z.string().trim().email().max(255).nullable().optional();
const SourceSchema = z.enum(CRM_LEAD_SOURCES);
const StatusSchema = z.enum(CRM_LEAD_STATUSES);
const ScoreSchema = z.number().int().min(0).max(100).optional();
const NotesSchema = z.string().trim().max(5000).nullable().optional();
const LostReasonSchema = z.string().trim().max(255).nullable().optional();
const EstimatedValueSchema = z.number().min(0).nullable().optional();
const LimitSchema = z.number().int().min(1).max(200).optional();

function validate<T>(schema: z.ZodType<T>, value: unknown, field: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new CrmLeadValidationError(
      `${field}: ${result.error.issues[0].message}`,
      field,
    );
  }
  return result.data;
}

function mapEntityToDto(entity: CrmLeadEntity): CrmLead {
  return {
    id: entity.id,
    organizationId: entity.organization_id,
    customerId: entity.customer_id,
    assignedUserId: entity.assigned_user_id,
    assignedUserName: entity.assigned_user_name,
    name: entity.name,
    phone: entity.phone,
    email: entity.email,
    source: entity.source,
    status: entity.status as CrmLeadStatus,
    currentStageKey: entity.current_stage_key,
    score: entity.score,
    estimatedValue: entity.estimated_value
      ? Number(entity.estimated_value)
      : null,
    lastContactAt: entity.last_contact_at,
    nextFollowUpAt: entity.next_follow_up_at,
    lostReason: entity.lost_reason,
    notes: entity.notes,
    createdBy: entity.created_by,
    updatedBy: entity.updated_by,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

function mapEntityToSummary(entity: CrmLeadEntity): CrmLeadSummary {
  return {
    id: entity.id,
    name: entity.name,
    phone: entity.phone,
    email: entity.email,
    source: entity.source,
    status: entity.status as CrmLeadStatus,
    currentStageKey: entity.current_stage_key,
    score: entity.score,
    estimatedValue: entity.estimated_value
      ? Number(entity.estimated_value)
      : null,
    assignedUserName: entity.assigned_user_name,
    nextFollowUpAt: entity.next_follow_up_at,
    lastContactAt: entity.last_contact_at,
    createdAt: entity.created_at,
  };
}

function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[CrmLeadService] Erro em ${operation}:`, error);

  if (error instanceof CrmLeadValidationError) {
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
  console.error(`[CrmLeadService] Erro em ${operation}:`, error);

  if (error instanceof CrmLeadValidationError) {
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

async function findLeadById(params: {
  leadId: string;
  organizationId: string;
}): Promise<ServiceResponse<CrmLead>> {
  try {
    const leadId = validate(IdSchema, params.leadId, "leadId");
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );

    const query = `
      SELECT id, organization_id, customer_id, assigned_user_id, assigned_user_name,
             name, phone, email, source, status, current_stage_key, score,
             estimated_value, last_contact_at, next_follow_up_at, lost_reason,
             notes, created_by, updated_by, created_at, updated_at
      FROM ${CRM_LEAD_TABLES.LEAD}
      WHERE id = ? AND organization_id = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<CrmLeadEntity>(query, [
      leadId,
      organizationId,
    ]);

    if (results.length === 0) {
      return { success: true, data: null, error: null };
    }

    return { success: true, data: mapEntityToDto(results[0]), error: null };
  } catch (error) {
    return handleError<CrmLead>(error, "findLeadById");
  }
}

async function findLeadsByOrganization(params: {
  organizationId: string;
  status?: CrmLeadStatus;
  stageKey?: string;
  assignedUserId?: string;
  source?: string;
  limit?: number;
}): Promise<ServiceResponse<CrmLeadSummary[]>> {
  try {
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );
    const limit = validate(LimitSchema, params.limit, "limit") ?? 100;

    const conditions = ["organization_id = ?"];
    const queryParams: Array<string | number | null> = [organizationId];

    if (params.status) {
      conditions.push("status = ?");
      queryParams.push(validate(StatusSchema, params.status, "status"));
    }

    if (params.stageKey) {
      conditions.push("current_stage_key = ?");
      queryParams.push(params.stageKey);
    }

    if (params.assignedUserId) {
      conditions.push("assigned_user_id = ?");
      queryParams.push(
        validate(IdSchema, params.assignedUserId, "assignedUserId"),
      );
    }

    if (params.source) {
      conditions.push("source = ?");
      queryParams.push(params.source);
    }

    queryParams.push(limit);

    const query = `
      SELECT id, organization_id, customer_id, assigned_user_id, assigned_user_name,
             name, phone, email, source, status, current_stage_key, score,
             estimated_value, last_contact_at, next_follow_up_at, lost_reason,
             notes, created_by, updated_by, created_at, updated_at
      FROM ${CRM_LEAD_TABLES.LEAD}
      WHERE ${conditions.join(" AND ")}
      ORDER BY updated_at DESC
      LIMIT ?
    `;

    const results = await dbService.selectExecute<CrmLeadEntity>(
      query,
      queryParams,
    );

    return {
      success: true,
      data: results.map(mapEntityToSummary),
      error: null,
    };
  } catch (error) {
    return handleError<CrmLeadSummary[]>(error, "findLeadsByOrganization");
  }
}

async function findLeadsByStageGrouped(params: {
  organizationId: string;
  assignedUserId?: string;
}): Promise<ServiceResponse<CrmLeadSummary[]>> {
  try {
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );

    const conditions = ["l.organization_id = ?", "l.status = 'open'"];
    const queryParams: Array<string | null> = [organizationId];

    if (params.assignedUserId) {
      conditions.push("l.assigned_user_id = ?");
      queryParams.push(
        validate(IdSchema, params.assignedUserId, "assignedUserId"),
      );
    }

    const query = `
      SELECT l.id, l.organization_id, l.customer_id, l.assigned_user_id,
             l.assigned_user_name, l.name, l.phone, l.email, l.source,
             l.status, l.current_stage_key, l.score, l.estimated_value,
             l.last_contact_at, l.next_follow_up_at, l.lost_reason,
             l.notes, l.created_by, l.updated_by, l.created_at, l.updated_at
      FROM ${CRM_LEAD_TABLES.LEAD} l
      INNER JOIN crm_stage s ON s.stage_key = l.current_stage_key
      WHERE ${conditions.join(" AND ")}
      ORDER BY s.sort_order ASC, l.updated_at DESC
    `;

    const results = await dbService.selectExecute<CrmLeadEntity>(
      query,
      queryParams,
    );

    return {
      success: true,
      data: results.map(mapEntityToSummary),
      error: null,
    };
  } catch (error) {
    return handleError<CrmLeadSummary[]>(error, "findLeadsByStageGrouped");
  }
}

async function createLead(params: {
  organizationId: string;
  assignedUserId: string;
  assignedUserName: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  source: string;
  currentStageKey?: string;
  score?: number;
  estimatedValue?: number | null;
  notes?: string | null;
  createdBy: string;
}): Promise<ModifyResponse & { id?: string }> {
  try {
    const id = randomUUID();
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );
    const assignedUserId = validate(
      IdSchema,
      params.assignedUserId,
      "assignedUserId",
    );
    const assignedUserName = validate(
      NameSchema,
      params.assignedUserName,
      "assignedUserName",
    );
    const name = validate(NameSchema, params.name, "name");
    const phone = validate(PhoneSchema, params.phone, "phone") ?? null;
    const email = validate(EmailSchema, params.email, "email") ?? null;
    const source = validate(SourceSchema, params.source, "source");
    const currentStageKey = params.currentStageKey ?? "lead";
    const score = validate(ScoreSchema, params.score, "score") ?? 0;
    const estimatedValue =
      validate(EstimatedValueSchema, params.estimatedValue, "estimatedValue") ??
      null;
    const notes = validate(NotesSchema, params.notes, "notes") ?? null;
    const createdBy = validate(IdSchema, params.createdBy, "createdBy");

    const query = `
      INSERT INTO ${CRM_LEAD_TABLES.LEAD} (
        id, organization_id, customer_id, assigned_user_id, assigned_user_name,
        name, phone, email, source, status, current_stage_key, score,
        estimated_value, last_contact_at, next_follow_up_at, lost_reason,
        notes, created_by, updated_by, created_at, updated_at
      )
      VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, NOW(), NOW())
    `;

    const result = await dbService.modifyExecute(query, [
      id,
      organizationId,
      assignedUserId,
      assignedUserName,
      name,
      phone,
      email,
      source,
      currentStageKey,
      score,
      estimatedValue,
      notes,
      createdBy,
      createdBy,
    ]);

    return {
      success: true,
      affectedRows: result.affectedRows,
      error: null,
      id,
    };
  } catch (error) {
    return { ...handleModifyError(error, "createLead") };
  }
}

async function updateLead(params: {
  leadId: string;
  organizationId: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  source?: string;
  score?: number;
  estimatedValue?: number | null;
  notes?: string | null;
  nextFollowUpAt?: Date | string | null;
  lastContactAt?: Date | string | null;
  updatedBy: string;
}): Promise<ModifyResponse> {
  try {
    const leadId = validate(IdSchema, params.leadId, "leadId");
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );
    const updatedBy = validate(IdSchema, params.updatedBy, "updatedBy");

    const sets: string[] = ["updated_by = ?", "updated_at = NOW()"];
    const queryParams: Array<string | number | Date | null> = [updatedBy];

    if (params.name !== undefined) {
      sets.push("name = ?");
      queryParams.push(validate(NameSchema, params.name, "name"));
    }
    if (params.phone !== undefined) {
      sets.push("phone = ?");
      queryParams.push(validate(PhoneSchema, params.phone, "phone") ?? null);
    }
    if (params.email !== undefined) {
      sets.push("email = ?");
      queryParams.push(validate(EmailSchema, params.email, "email") ?? null);
    }
    if (params.source !== undefined) {
      sets.push("source = ?");
      queryParams.push(validate(SourceSchema, params.source, "source"));
    }
    if (params.score !== undefined) {
      sets.push("score = ?");
      queryParams.push(validate(ScoreSchema, params.score, "score") ?? 0);
    }
    if (params.estimatedValue !== undefined) {
      sets.push("estimated_value = ?");
      queryParams.push(
        validate(
          EstimatedValueSchema,
          params.estimatedValue,
          "estimatedValue",
        ) ?? null,
      );
    }
    if (params.notes !== undefined) {
      sets.push("notes = ?");
      queryParams.push(validate(NotesSchema, params.notes, "notes") ?? null);
    }
    if (params.nextFollowUpAt !== undefined) {
      sets.push("next_follow_up_at = ?");
      queryParams.push(
        params.nextFollowUpAt ? new Date(params.nextFollowUpAt) : null,
      );
    }
    if (params.lastContactAt !== undefined) {
      sets.push("last_contact_at = ?");
      queryParams.push(
        params.lastContactAt ? new Date(params.lastContactAt) : null,
      );
    }

    queryParams.push(leadId, organizationId);

    const query = `
      UPDATE ${CRM_LEAD_TABLES.LEAD}
      SET ${sets.join(", ")}
      WHERE id = ? AND organization_id = ?
    `;

    const result = await dbService.modifyExecute(query, queryParams);
    return { success: true, affectedRows: result.affectedRows, error: null };
  } catch (error) {
    return handleModifyError(error, "updateLead");
  }
}

async function updateLeadStage(params: {
  leadId: string;
  organizationId: string;
  newStageKey: string;
  updatedBy: string;
}): Promise<ModifyResponse> {
  try {
    const leadId = validate(IdSchema, params.leadId, "leadId");
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );
    const updatedBy = validate(IdSchema, params.updatedBy, "updatedBy");

    const query = `
      UPDATE ${CRM_LEAD_TABLES.LEAD}
      SET current_stage_key = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ? AND organization_id = ?
    `;

    const result = await dbService.modifyExecute(query, [
      params.newStageKey,
      updatedBy,
      leadId,
      organizationId,
    ]);

    return { success: true, affectedRows: result.affectedRows, error: null };
  } catch (error) {
    return handleModifyError(error, "updateLeadStage");
  }
}

async function updateLeadStatus(params: {
  leadId: string;
  organizationId: string;
  status: CrmLeadStatus;
  lostReason?: string | null;
  updatedBy: string;
}): Promise<ModifyResponse> {
  try {
    const leadId = validate(IdSchema, params.leadId, "leadId");
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );
    const status = validate(StatusSchema, params.status, "status");
    const updatedBy = validate(IdSchema, params.updatedBy, "updatedBy");
    const lostReason =
      validate(LostReasonSchema, params.lostReason, "lostReason") ?? null;

    const query = `
      UPDATE ${CRM_LEAD_TABLES.LEAD}
      SET status = ?, lost_reason = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ? AND organization_id = ?
    `;

    const result = await dbService.modifyExecute(query, [
      status,
      lostReason,
      updatedBy,
      leadId,
      organizationId,
    ]);

    return { success: true, affectedRows: result.affectedRows, error: null };
  } catch (error) {
    return handleModifyError(error, "updateLeadStatus");
  }
}

async function linkLeadToCustomer(params: {
  leadId: string;
  organizationId: string;
  customerId: string;
  updatedBy: string;
}): Promise<ModifyResponse> {
  try {
    const leadId = validate(IdSchema, params.leadId, "leadId");
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );
    const customerId = validate(IdSchema, params.customerId, "customerId");
    const updatedBy = validate(IdSchema, params.updatedBy, "updatedBy");

    const query = `
      UPDATE ${CRM_LEAD_TABLES.LEAD}
      SET customer_id = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ? AND organization_id = ?
    `;

    const result = await dbService.modifyExecute(query, [
      customerId,
      updatedBy,
      leadId,
      organizationId,
    ]);

    return { success: true, affectedRows: result.affectedRows, error: null };
  } catch (error) {
    return handleModifyError(error, "linkLeadToCustomer");
  }
}

async function deleteLead(params: {
  leadId: string;
  organizationId: string;
}): Promise<ModifyResponse> {
  try {
    const leadId = validate(IdSchema, params.leadId, "leadId");
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );

    const query = `
      DELETE FROM ${CRM_LEAD_TABLES.LEAD}
      WHERE id = ? AND organization_id = ?
    `;

    const result = await dbService.modifyExecute(query, [
      leadId,
      organizationId,
    ]);

    return { success: true, affectedRows: result.affectedRows, error: null };
  } catch (error) {
    return handleModifyError(error, "deleteLead");
  }
}

async function countLeadsByStage(params: {
  organizationId: string;
}): Promise<
  ServiceResponse<Array<{ stageKey: string; count: number; total: number }>>
> {
  try {
    const organizationId = validate(
      IdSchema,
      params.organizationId,
      "organizationId",
    );

    const query = `
      SELECT current_stage_key AS stage_key,
             COUNT(*) AS count,
             COALESCE(SUM(estimated_value), 0) AS total
      FROM ${CRM_LEAD_TABLES.LEAD}
      WHERE organization_id = ? AND status = 'open'
      GROUP BY current_stage_key
    `;

    const results = await dbService.selectExecute<
      RowDataPacket & { stage_key: string; count: number; total: number }
    >(query, [organizationId]);

    return {
      success: true,
      data: results.map((r) => ({
        stageKey: r.stage_key,
        count: Number(r.count),
        total: Number(r.total),
      })),
      error: null,
    };
  } catch (error) {
    return handleError<
      Array<{ stageKey: string; count: number; total: number }>
    >(error, "countLeadsByStage");
  }
}

export const CrmLeadService = {
  findLeadById,
  findLeadsByOrganization,
  findLeadsByStageGrouped,
  createLead,
  updateLead,
  updateLeadStage,
  updateLeadStatus,
  linkLeadToCustomer,
  deleteLead,
  countLeadsByStage,
};

export type {
  CrmLead,
  CrmLeadSource,
  CrmLeadStatus,
  CrmLeadSummary,
  ModifyResponse,
  ServiceResponse,
} from "./types/crm-lead.types";
export {
  CRM_LEAD_SOURCES,
  CRM_LEAD_STATUSES,
  CRM_LEAD_TABLES,
} from "./types/crm-lead.types";
