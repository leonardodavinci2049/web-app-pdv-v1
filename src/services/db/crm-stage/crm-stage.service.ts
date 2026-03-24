import "server-only";

import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/database/dbConnection";

import {
  CRM_STAGE_TABLES,
  type CrmStage,
  type CrmStageEntity,
  type ServiceResponse,
} from "./types/crm-stage.types";

function mapEntityToDto(entity: CrmStageEntity): CrmStage {
  return {
    id: entity.id,
    stageKey: entity.stage_key,
    name: entity.name,
    sortOrder: entity.sort_order,
    probability: Number(entity.probability),
    isActive: entity.is_active === 1,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[CrmStageService] Erro em ${operation}:`, error);

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

async function findAllActiveStages(): Promise<ServiceResponse<CrmStage[]>> {
  try {
    const query = `
      SELECT id, stage_key, name, sort_order, probability, is_active,
             created_at, updated_at
      FROM ${CRM_STAGE_TABLES.STAGE}
      WHERE is_active = 1
      ORDER BY sort_order ASC
    `;

    const results = await dbService.selectExecute<CrmStageEntity>(query, []);

    return {
      success: true,
      data: results.map(mapEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<CrmStage[]>(error, "findAllActiveStages");
  }
}

async function findStageByKey(
  stageKey: string,
): Promise<ServiceResponse<CrmStage>> {
  try {
    const query = `
      SELECT id, stage_key, name, sort_order, probability, is_active,
             created_at, updated_at
      FROM ${CRM_STAGE_TABLES.STAGE}
      WHERE stage_key = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<CrmStageEntity>(query, [
      stageKey,
    ]);

    if (results.length === 0) {
      return { success: true, data: null, error: null };
    }

    return {
      success: true,
      data: mapEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<CrmStage>(error, "findStageByKey");
  }
}

export const CrmStageService = {
  findAllActiveStages,
  findStageByKey,
};

export type { CrmStage, ServiceResponse } from "./types/crm-stage.types";
export { CRM_STAGE_KEYS, CRM_STAGE_TABLES } from "./types/crm-stage.types";
