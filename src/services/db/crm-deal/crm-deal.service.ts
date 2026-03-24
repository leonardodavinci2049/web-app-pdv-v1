import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/database/dbConnection";

import {
  CRM_DEAL_STATUSES,
  CRM_DEAL_TABLES,
  type CrmDeal,
  type CrmDealEntity,
  type CrmDealStatus,
  type ModifyResponse,
  type ServiceResponse,
} from "./types/crm-deal.types";

const IdSchema = z.string().trim().min(1).max(128);
const AmountSchema = z.number().min(0);
const StatusSchema = z.enum(CRM_DEAL_STATUSES);

function mapEntityToDto(entity: CrmDealEntity): CrmDeal {
  return {
    id: entity.id,
    leadId: entity.lead_id,
    organizationId: entity.organization_id,
    budgetId: entity.budget_id,
    orderId: entity.order_id,
    amount: Number(entity.amount),
    status: entity.status as CrmDealStatus,
    closedAt: entity.closed_at,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[CrmDealService] Erro em ${operation}:`, error);

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
  console.error(`[CrmDealService] Erro em ${operation}:`, error);

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

async function createDeal(params: {
  leadId: string;
  organizationId: string;
  amount?: number;
  budgetId?: string | null;
  orderId?: string | null;
}): Promise<ModifyResponse & { id?: string }> {
  try {
    const id = randomUUID();
    const leadId = IdSchema.parse(params.leadId);
    const organizationId = IdSchema.parse(params.organizationId);
    const amount = AmountSchema.parse(params.amount ?? 0);

    const query = `
      INSERT INTO ${CRM_DEAL_TABLES.DEAL} (
        id, lead_id, organization_id, budget_id, order_id,
        amount, status, closed_at, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'open', NULL, NOW(), NOW())
    `;

    const result = await dbService.modifyExecute(query, [
      id,
      leadId,
      organizationId,
      params.budgetId ?? null,
      params.orderId ?? null,
      amount,
    ]);

    return {
      success: true,
      affectedRows: result.affectedRows,
      error: null,
      id,
    };
  } catch (error) {
    return { ...handleModifyError(error, "createDeal") };
  }
}

async function updateDealStatus(params: {
  dealId: string;
  organizationId: string;
  status: CrmDealStatus;
  amount?: number;
}): Promise<ModifyResponse> {
  try {
    const dealId = IdSchema.parse(params.dealId);
    const organizationId = IdSchema.parse(params.organizationId);
    const status = StatusSchema.parse(params.status);

    const closedAt = status === "won" || status === "lost" ? "NOW()" : "NULL";

    const sets = [
      `status = ?`,
      `closed_at = ${closedAt}`,
      `updated_at = NOW()`,
    ];
    const queryParams: Array<string | number> = [status];

    if (params.amount !== undefined) {
      sets.push("amount = ?");
      queryParams.push(AmountSchema.parse(params.amount));
    }

    queryParams.push(dealId, organizationId);

    const query = `
      UPDATE ${CRM_DEAL_TABLES.DEAL}
      SET ${sets.join(", ")}
      WHERE id = ? AND organization_id = ?
    `;

    const result = await dbService.modifyExecute(query, queryParams);
    return { success: true, affectedRows: result.affectedRows, error: null };
  } catch (error) {
    return handleModifyError(error, "updateDealStatus");
  }
}

async function findDealByLead(params: {
  leadId: string;
}): Promise<ServiceResponse<CrmDeal>> {
  try {
    const leadId = IdSchema.parse(params.leadId);

    const query = `
      SELECT id, lead_id, organization_id, budget_id, order_id,
             amount, status, closed_at, created_at, updated_at
      FROM ${CRM_DEAL_TABLES.DEAL}
      WHERE lead_id = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<CrmDealEntity>(query, [
      leadId,
    ]);

    if (results.length === 0) {
      return { success: true, data: null, error: null };
    }

    return { success: true, data: mapEntityToDto(results[0]), error: null };
  } catch (error) {
    return handleError<CrmDeal>(error, "findDealByLead");
  }
}

async function findDealsByOrganization(params: {
  organizationId: string;
  status?: CrmDealStatus;
  limit?: number;
}): Promise<ServiceResponse<CrmDeal[]>> {
  try {
    const organizationId = IdSchema.parse(params.organizationId);
    const limit = params.limit ?? 100;

    const conditions = ["organization_id = ?"];
    const queryParams: Array<string | number> = [organizationId];

    if (params.status) {
      conditions.push("status = ?");
      queryParams.push(StatusSchema.parse(params.status));
    }

    queryParams.push(limit);

    const query = `
      SELECT id, lead_id, organization_id, budget_id, order_id,
             amount, status, closed_at, created_at, updated_at
      FROM ${CRM_DEAL_TABLES.DEAL}
      WHERE ${conditions.join(" AND ")}
      ORDER BY updated_at DESC
      LIMIT ?
    `;

    const results = await dbService.selectExecute<CrmDealEntity>(
      query,
      queryParams,
    );

    return {
      success: true,
      data: results.map(mapEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<CrmDeal[]>(error, "findDealsByOrganization");
  }
}

export const CrmDealService = {
  createDeal,
  updateDealStatus,
  findDealByLead,
  findDealsByOrganization,
};

export type {
  CrmDeal,
  CrmDealStatus,
  ModifyResponse,
  ServiceResponse,
} from "./types/crm-deal.types";
export { CRM_DEAL_STATUSES, CRM_DEAL_TABLES } from "./types/crm-deal.types";
