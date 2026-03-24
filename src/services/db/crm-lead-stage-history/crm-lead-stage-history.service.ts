import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/database/dbConnection";

import {
  CRM_LEAD_STAGE_HISTORY_TABLES,
  type CrmLeadStageHistory,
  type CrmLeadStageHistoryEntity,
  type ModifyResponse,
  type ServiceResponse,
} from "./types/crm-lead-stage-history.types";

const IdSchema = z.string().trim().min(1).max(128);
const NotesSchema = z.string().trim().max(5000).nullable().optional();

function mapEntityToDto(
  entity: CrmLeadStageHistoryEntity,
): CrmLeadStageHistory {
  return {
    id: entity.id,
    leadId: entity.lead_id,
    fromStageKey: entity.from_stage_key,
    toStageKey: entity.to_stage_key,
    changedBy: entity.changed_by,
    changedAt: entity.changed_at,
    notes: entity.notes,
  };
}

function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[CrmLeadStageHistoryService] Erro em ${operation}:`, error);

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
  console.error(`[CrmLeadStageHistoryService] Erro em ${operation}:`, error);

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

async function createStageTransition(params: {
  leadId: string;
  fromStageKey: string | null;
  toStageKey: string;
  changedBy: string;
  notes?: string | null;
}): Promise<ModifyResponse> {
  try {
    const id = randomUUID();
    const leadId = IdSchema.parse(params.leadId);
    const toStageKey = IdSchema.parse(params.toStageKey);
    const changedBy = IdSchema.parse(params.changedBy);
    const notes = NotesSchema.parse(params.notes) ?? null;

    const query = `
      INSERT INTO ${CRM_LEAD_STAGE_HISTORY_TABLES.HISTORY} (
        id, lead_id, from_stage_key, to_stage_key, changed_by, changed_at, notes
      )
      VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `;

    const result = await dbService.modifyExecute(query, [
      id,
      leadId,
      params.fromStageKey,
      toStageKey,
      changedBy,
      notes,
    ]);

    return { success: true, affectedRows: result.affectedRows, error: null };
  } catch (error) {
    return handleModifyError(error, "createStageTransition");
  }
}

async function findHistoryByLead(params: {
  leadId: string;
}): Promise<ServiceResponse<CrmLeadStageHistory[]>> {
  try {
    const leadId = IdSchema.parse(params.leadId);

    const query = `
      SELECT id, lead_id, from_stage_key, to_stage_key, changed_by, changed_at, notes
      FROM ${CRM_LEAD_STAGE_HISTORY_TABLES.HISTORY}
      WHERE lead_id = ?
      ORDER BY changed_at ASC
    `;

    const results = await dbService.selectExecute<CrmLeadStageHistoryEntity>(
      query,
      [leadId],
    );

    return {
      success: true,
      data: results.map(mapEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<CrmLeadStageHistory[]>(error, "findHistoryByLead");
  }
}

export const CrmLeadStageHistoryService = {
  createStageTransition,
  findHistoryByLead,
};

export type {
  CrmLeadStageHistory,
  ModifyResponse,
  ServiceResponse,
} from "./types/crm-lead-stage-history.types";
export { CRM_LEAD_STAGE_HISTORY_TABLES } from "./types/crm-lead-stage-history.types";
