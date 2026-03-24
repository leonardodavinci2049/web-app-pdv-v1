import "server-only";

import type { RowDataPacket } from "mysql2/promise";

export const CRM_ACTIVITY_TABLES = {
  ACTIVITY: "crm_activity",
} as const;

export const CRM_ACTIVITY_TYPES = [
  "ligacao",
  "mensagem",
  "visita",
  "anotacao",
  "mudanca_etapa",
  "orcamento",
  "pedido",
] as const;

export type CrmActivityType = (typeof CRM_ACTIVITY_TYPES)[number];

export interface CrmActivityEntity extends RowDataPacket {
  id: string;
  lead_id: string;
  organization_id: string;
  activity_type: string;
  description: string;
  metadata_json: string | null;
  created_by: string;
  created_at: Date;
}

export interface CrmActivity {
  id: string;
  leadId: string;
  organizationId: string;
  activityType: CrmActivityType;
  description: string;
  metadataJson: Record<string, unknown> | null;
  createdBy: string;
  createdAt: Date;
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
