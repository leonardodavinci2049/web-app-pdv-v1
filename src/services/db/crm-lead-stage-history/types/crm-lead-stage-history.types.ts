import "server-only";

import type { RowDataPacket } from "mysql2/promise";

export const CRM_LEAD_STAGE_HISTORY_TABLES = {
  HISTORY: "crm_lead_stage_history",
} as const;

export interface CrmLeadStageHistoryEntity extends RowDataPacket {
  id: string;
  lead_id: string;
  from_stage_key: string | null;
  to_stage_key: string;
  changed_by: string;
  changed_at: Date;
  notes: string | null;
}

export interface CrmLeadStageHistory {
  id: string;
  leadId: string;
  fromStageKey: string | null;
  toStageKey: string;
  changedBy: string;
  changedAt: Date;
  notes: string | null;
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
