import "server-only";

import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/database/dbConnection";

import {
  CRM_TASK_PRIORITIES,
  CRM_TASK_STATUSES,
  CRM_TASK_TABLES,
  type CrmTask,
  type CrmTaskEntity,
  type CrmTaskPriority,
  type CrmTaskStatus,
  type CrmTaskWithLeadName,
  type ModifyResponse,
  type ServiceResponse,
} from "./types/crm-task.types";

const IdSchema = z.string().trim().min(1).max(128);
const TitleSchema = z.string().trim().min(1).max(255);
const DescriptionSchema = z.string().trim().max(5000).nullable().optional();
const StatusSchema = z.enum(CRM_TASK_STATUSES);
const PrioritySchema = z.enum(CRM_TASK_PRIORITIES);
const LimitSchema = z.number().int().min(1).max(200).optional();

function mapEntityToDto(entity: CrmTaskEntity): CrmTask {
  return {
    id: entity.id,
    leadId: entity.lead_id,
    organizationId: entity.organization_id,
    assignedUserId: entity.assigned_user_id,
    title: entity.title,
    description: entity.description,
    dueDate: entity.due_date,
    status: entity.status as CrmTaskStatus,
    priority: entity.priority as CrmTaskPriority,
    completedAt: entity.completed_at,
    createdBy: entity.created_by,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

function mapEntityToTaskWithLeadName(
  entity: CrmTaskEntity & { lead_name?: string },
): CrmTaskWithLeadName {
  return {
    ...mapEntityToDto(entity),
    leadName: entity.lead_name ?? "",
  };
}

function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[CrmTaskService] Erro em ${operation}:`, error);

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
  console.error(`[CrmTaskService] Erro em ${operation}:`, error);

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

async function createTask(params: {
  leadId: string;
  organizationId: string;
  assignedUserId: string;
  title: string;
  description?: string | null;
  dueDate: Date | string;
  priority?: CrmTaskPriority;
  createdBy: string;
}): Promise<ModifyResponse & { id?: string }> {
  try {
    const id = randomUUID();
    const leadId = IdSchema.parse(params.leadId);
    const organizationId = IdSchema.parse(params.organizationId);
    const assignedUserId = IdSchema.parse(params.assignedUserId);
    const title = TitleSchema.parse(params.title);
    const description = DescriptionSchema.parse(params.description) ?? null;
    const priority = PrioritySchema.parse(params.priority ?? "medium");
    const createdBy = IdSchema.parse(params.createdBy);
    const dueDate = new Date(params.dueDate);

    const query = `
      INSERT INTO ${CRM_TASK_TABLES.TASK} (
        id, lead_id, organization_id, assigned_user_id, title,
        description, due_date, status, priority, completed_at,
        created_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, NULL, ?, NOW(), NOW())
    `;

    const result = await dbService.modifyExecute(query, [
      id,
      leadId,
      organizationId,
      assignedUserId,
      title,
      description,
      dueDate,
      priority,
      createdBy,
    ]);

    return {
      success: true,
      affectedRows: result.affectedRows,
      error: null,
      id,
    };
  } catch (error) {
    return { ...handleModifyError(error, "createTask") };
  }
}

async function updateTaskStatus(params: {
  taskId: string;
  organizationId: string;
  status: CrmTaskStatus;
}): Promise<ModifyResponse> {
  try {
    const taskId = IdSchema.parse(params.taskId);
    const organizationId = IdSchema.parse(params.organizationId);
    const status = StatusSchema.parse(params.status);

    const completedAt = status === "completed" ? "NOW()" : "NULL";

    const query = `
      UPDATE ${CRM_TASK_TABLES.TASK}
      SET status = ?, completed_at = ${completedAt}, updated_at = NOW()
      WHERE id = ? AND organization_id = ?
    `;

    const result = await dbService.modifyExecute(query, [
      status,
      taskId,
      organizationId,
    ]);

    return { success: true, affectedRows: result.affectedRows, error: null };
  } catch (error) {
    return handleModifyError(error, "updateTaskStatus");
  }
}

async function findTasksByUser(params: {
  assignedUserId: string;
  organizationId: string;
  status?: CrmTaskStatus;
  limit?: number;
}): Promise<ServiceResponse<CrmTaskWithLeadName[]>> {
  try {
    const assignedUserId = IdSchema.parse(params.assignedUserId);
    const organizationId = IdSchema.parse(params.organizationId);
    const limit = LimitSchema.parse(params.limit) ?? 100;

    const conditions = ["t.assigned_user_id = ?", "t.organization_id = ?"];
    const queryParams: Array<string | number> = [
      assignedUserId,
      organizationId,
    ];

    if (params.status) {
      conditions.push("t.status = ?");
      queryParams.push(StatusSchema.parse(params.status));
    }

    queryParams.push(limit);

    const query = `
      SELECT t.id, t.lead_id, t.organization_id, t.assigned_user_id,
             t.title, t.description, t.due_date, t.status, t.priority,
             t.completed_at, t.created_by, t.created_at, t.updated_at,
             l.name AS lead_name
      FROM ${CRM_TASK_TABLES.TASK} t
      INNER JOIN crm_lead l ON l.id = t.lead_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY t.due_date ASC
      LIMIT ?
    `;

    const results = await dbService.selectExecute<
      CrmTaskEntity & { lead_name: string }
    >(query, queryParams);

    return {
      success: true,
      data: results.map(mapEntityToTaskWithLeadName),
      error: null,
    };
  } catch (error) {
    return handleError<CrmTaskWithLeadName[]>(error, "findTasksByUser");
  }
}

async function findTasksByLead(params: {
  leadId: string;
  limit?: number;
}): Promise<ServiceResponse<CrmTask[]>> {
  try {
    const leadId = IdSchema.parse(params.leadId);
    const limit = LimitSchema.parse(params.limit) ?? 50;

    const query = `
      SELECT id, lead_id, organization_id, assigned_user_id,
             title, description, due_date, status, priority,
             completed_at, created_by, created_at, updated_at
      FROM ${CRM_TASK_TABLES.TASK}
      WHERE lead_id = ?
      ORDER BY due_date ASC
      LIMIT ?
    `;

    const results = await dbService.selectExecute<CrmTaskEntity>(query, [
      leadId,
      limit,
    ]);

    return {
      success: true,
      data: results.map(mapEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<CrmTask[]>(error, "findTasksByLead");
  }
}

async function countOverdueTasks(params: {
  organizationId: string;
  assignedUserId?: string;
}): Promise<ServiceResponse<number>> {
  try {
    const organizationId = IdSchema.parse(params.organizationId);

    const conditions = [
      "organization_id = ?",
      "status IN ('pending', 'in_progress')",
      "due_date < NOW()",
    ];
    const queryParams: string[] = [organizationId];

    if (params.assignedUserId) {
      conditions.push("assigned_user_id = ?");
      queryParams.push(IdSchema.parse(params.assignedUserId));
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM ${CRM_TASK_TABLES.TASK}
      WHERE ${conditions.join(" AND ")}
    `;

    const results = await dbService.selectExecute<
      RowDataPacket & { total: number }
    >(query, queryParams);

    return {
      success: true,
      data: Number(results[0]?.total ?? 0),
      error: null,
    };
  } catch (error) {
    return handleError<number>(error, "countOverdueTasks");
  }
}

export const CrmTaskService = {
  createTask,
  updateTaskStatus,
  findTasksByUser,
  findTasksByLead,
  countOverdueTasks,
};

export type {
  CrmTask,
  CrmTaskPriority,
  CrmTaskStatus,
  CrmTaskWithLeadName,
  ModifyResponse,
  ServiceResponse,
} from "./types/crm-task.types";
export {
  CRM_TASK_PRIORITIES,
  CRM_TASK_STATUSES,
  CRM_TASK_TABLES,
} from "./types/crm-task.types";
