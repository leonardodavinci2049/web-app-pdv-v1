import "server-only";

import type { RowDataPacket } from "mysql2/promise";

export const CRM_LEAD_TABLES = {
  LEAD: "crm_lead",
} as const;

export const CRM_LEAD_SOURCES = [
  "indicacao",
  "site",
  "telefone",
  "visita",
  "rede_social",
  "campanha",
  "outros",
] as const;

export const CRM_LEAD_STATUSES = ["open", "won", "lost"] as const;

export type CrmLeadSource = (typeof CRM_LEAD_SOURCES)[number];
export type CrmLeadStatus = (typeof CRM_LEAD_STATUSES)[number];

export interface CrmLeadEntity extends RowDataPacket {
  id: string;
  organization_id: string;
  customer_id: string | null;
  assigned_user_id: string;
  assigned_user_name: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  status: string;
  current_stage_key: string;
  score: number;
  estimated_value: number | null;
  last_contact_at: Date | null;
  next_follow_up_at: Date | null;
  lost_reason: string | null;
  notes: string | null;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CrmLead {
  id: string;
  organizationId: string;
  customerId: string | null;
  assignedUserId: string;
  assignedUserName: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  status: CrmLeadStatus;
  currentStageKey: string;
  score: number;
  estimatedValue: number | null;
  lastContactAt: Date | null;
  nextFollowUpAt: Date | null;
  lostReason: string | null;
  notes: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmLeadSummary {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  status: CrmLeadStatus;
  currentStageKey: string;
  score: number;
  estimatedValue: number | null;
  assignedUserName: string;
  nextFollowUpAt: Date | null;
  lastContactAt: Date | null;
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

export class CrmLeadValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldName: string,
  ) {
    super(message);
    this.name = "CrmLeadValidationError";
  }
}
