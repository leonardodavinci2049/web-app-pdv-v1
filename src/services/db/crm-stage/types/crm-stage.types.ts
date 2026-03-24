import "server-only";

import type { RowDataPacket } from "mysql2/promise";

export const CRM_STAGE_TABLES = {
  STAGE: "crm_stage",
} as const;

export const CRM_STAGE_KEYS = [
  "lead",
  "contact",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export type CrmStageKey = (typeof CRM_STAGE_KEYS)[number];

export interface CrmStageEntity extends RowDataPacket {
  id: string;
  stage_key: string;
  name: string;
  sort_order: number;
  probability: number;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

export interface CrmStage {
  id: string;
  stageKey: string;
  name: string;
  sortOrder: number;
  probability: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
