import "server-only";

import type { RowDataPacket } from "mysql2/promise";

export const CRM_TASK_TABLES = {
  TASK: "crm_task",
} as const;

export const CRM_TASK_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const CRM_TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type CrmTaskStatus = (typeof CRM_TASK_STATUSES)[number];
export type CrmTaskPriority = (typeof CRM_TASK_PRIORITIES)[number];

export interface CrmTaskEntity extends RowDataPacket {
  id: string;
  lead_id: string;
  organization_id: string;
  assigned_user_id: string;
  title: string;
  description: string | null;
  due_date: Date;
  status: string;
  priority: string;
  completed_at: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CrmTask {
  id: string;
  leadId: string;
  organizationId: string;
  assignedUserId: string;
  title: string;
  description: string | null;
  dueDate: Date;
  status: CrmTaskStatus;
  priority: CrmTaskPriority;
  completedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmTaskWithLeadName extends CrmTask {
  leadName: string;
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
