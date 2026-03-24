import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { CrmTaskService } from "./crm-task.service";
import type {
  CrmTask,
  CrmTaskStatus,
  CrmTaskWithLeadName,
} from "./types/crm-task.types";

export interface CrmTasksResult {
  tasks: CrmTaskWithLeadName[];
  error: string | null;
}

export interface CrmTasksByLeadResult {
  tasks: CrmTask[];
  error: string | null;
}

export interface CrmOverdueCountResult {
  count: number;
  error: string | null;
}

export async function getCrmTasksByUser(params: {
  assignedUserId: string;
  organizationId: string;
  status?: CrmTaskStatus;
  limit?: number;
}): Promise<CrmTasksResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(
    CACHE_TAGS.crmTasks,
    CACHE_TAGS.crmTasksByUser(params.assignedUserId),
  );

  const response = await CrmTaskService.findTasksByUser(params);

  return {
    tasks: response.data ?? [],
    error: response.success ? null : response.error,
  };
}

export async function getCrmTasksByLead(params: {
  leadId: string;
  limit?: number;
}): Promise<CrmTasksByLeadResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(CACHE_TAGS.crmTasksByLead(params.leadId), CACHE_TAGS.crmTasks);

  const response = await CrmTaskService.findTasksByLead(params);

  return {
    tasks: response.data ?? [],
    error: response.success ? null : response.error,
  };
}

export async function getCrmOverdueTaskCount(params: {
  organizationId: string;
  assignedUserId?: string;
}): Promise<CrmOverdueCountResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(CACHE_TAGS.crmDashboard, CACHE_TAGS.crmTasks);

  const response = await CrmTaskService.countOverdueTasks(params);

  return {
    count: response.data ?? 0,
    error: response.success ? null : response.error,
  };
}
