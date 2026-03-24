import "server-only";

import type { RowDataPacket } from "mysql2/promise";

export const CRM_DEAL_TABLES = {
  DEAL: "crm_deal",
} as const;

export const CRM_DEAL_STATUSES = ["open", "won", "lost"] as const;

export type CrmDealStatus = (typeof CRM_DEAL_STATUSES)[number];

export interface CrmDealEntity extends RowDataPacket {
  id: string;
  lead_id: string;
  organization_id: string;
  budget_id: string | null;
  order_id: string | null;
  amount: number;
  status: string;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CrmDeal {
  id: string;
  leadId: string;
  organizationId: string;
  budgetId: string | null;
  orderId: string | null;
  amount: number;
  status: CrmDealStatus;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
