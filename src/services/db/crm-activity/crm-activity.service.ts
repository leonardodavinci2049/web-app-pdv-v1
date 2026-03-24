import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/database/dbConnection";

import {
  CRM_ACTIVITY_TABLES,
  CRM_ACTIVITY_TYPES,
  type CrmActivity,
  type CrmActivityEntity,
  type CrmActivityType,
  type ModifyResponse,
  type ServiceResponse,
} from "./types/crm-activity.types";

const IdSchema = z.string().trim().min(1).max(128);
const DescriptionSchema = z.string().trim().min(1).max(5000);
const ActivityTypeSchema = z.enum(CRM_ACTIVITY_TYPES);

function mapEntityToDto(entity: CrmActivityEntity): CrmActivity {
  let metadataJson: Record<string, unknown> | null = null;
  if (entity.metadata_json) {
    try {
      metadataJson = JSON.parse(entity.metadata_json) as Record<
        string,
        unknown
      >;
    } catch {
      metadataJson = null;
    }
  }

  return {
    id: entity.id,
    leadId: entity.lead_id,
    organizationId: entity.organization_id,
    activityType: entity.activity_type as CrmActivityType,
    description: entity.description,
    metadataJson,
    createdBy: entity.created_by,
    createdAt: entity.created_at,
  };
}

function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[CrmActivityService] Erro em ${operation}:`, error);

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
  console.error(`[CrmActivityService] Erro em ${operation}:`, error);

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

async function createActivity(params: {
  leadId: string;
  organizationId: string;
  activityType: CrmActivityType;
  description: string;
  metadataJson?: Record<string, unknown> | null;
  createdBy: string;
}): Promise<ModifyResponse> {
  try {
    const id = randomUUID();
    const leadId = IdSchema.parse(params.leadId);
    const organizationId = IdSchema.parse(params.organizationId);
    const activityType = ActivityTypeSchema.parse(params.activityType);
    const description = DescriptionSchema.parse(params.description);
    const createdBy = IdSchema.parse(params.createdBy);
    const metadataJson = params.metadataJson
      ? JSON.stringify(params.metadataJson)
      : null;

    const query = `
      INSERT INTO ${CRM_ACTIVITY_TABLES.ACTIVITY} (
        id, lead_id, organization_id, activity_type, description,
        metadata_json, created_by, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const result = await dbService.modifyExecute(query, [
      id,
      leadId,
      organizationId,
      activityType,
      description,
      metadataJson,
      createdBy,
    ]);

    return { success: true, affectedRows: result.affectedRows, error: null };
  } catch (error) {
    return handleModifyError(error, "createActivity");
  }
}

async function findActivitiesByLead(params: {
  leadId: string;
  limit?: number;
}): Promise<ServiceResponse<CrmActivity[]>> {
  try {
    const leadId = IdSchema.parse(params.leadId);
    const limit = params.limit ?? 50;

    const query = `
      SELECT id, lead_id, organization_id, activity_type, description,
             metadata_json, created_by, created_at
      FROM ${CRM_ACTIVITY_TABLES.ACTIVITY}
      WHERE lead_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const results = await dbService.selectExecute<CrmActivityEntity>(query, [
      leadId,
      limit,
    ]);

    return {
      success: true,
      data: results.map(mapEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<CrmActivity[]>(error, "findActivitiesByLead");
  }
}

export const CrmActivityService = {
  createActivity,
  findActivitiesByLead,
};

export type {
  CrmActivity,
  CrmActivityType,
  ModifyResponse,
  ServiceResponse,
} from "./types/crm-activity.types";
export {
  CRM_ACTIVITY_TABLES,
  CRM_ACTIVITY_TYPES,
} from "./types/crm-activity.types";
