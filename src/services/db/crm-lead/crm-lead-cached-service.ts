import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { CrmLeadService } from "./crm-lead.service";
import type {
  CrmLead,
  CrmLeadStatus,
  CrmLeadSummary,
} from "./types/crm-lead.types";

export interface CrmLeadsResult {
  leads: CrmLeadSummary[];
  error: string | null;
}

export interface CrmLeadResult {
  lead: CrmLead | null;
  error: string | null;
}

export interface CrmLeadStageCountResult {
  data: Array<{ stageKey: string; count: number; total: number }>;
  error: string | null;
}

export async function getCrmLeadById(params: {
  leadId: string;
  organizationId: string;
}): Promise<CrmLeadResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(CACHE_TAGS.crmLead(params.leadId), CACHE_TAGS.crmLeads);

  const response = await CrmLeadService.findLeadById(params);

  return {
    lead: response.data ?? null,
    error: response.success ? null : response.error,
  };
}

export async function getCrmLeadsByOrganization(params: {
  organizationId: string;
  status?: CrmLeadStatus;
  stageKey?: string;
  assignedUserId?: string;
  source?: string;
  limit?: number;
}): Promise<CrmLeadsResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(
    CACHE_TAGS.crmLeads,
    CACHE_TAGS.crmLeadsByOrg(params.organizationId),
  );

  const response = await CrmLeadService.findLeadsByOrganization(params);

  return {
    leads: response.data ?? [],
    error: response.success ? null : response.error,
  };
}

export async function getCrmLeadsByStageGrouped(params: {
  organizationId: string;
  assignedUserId?: string;
}): Promise<CrmLeadsResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(
    CACHE_TAGS.crmPipeline,
    CACHE_TAGS.crmLeadsByOrg(params.organizationId),
  );

  const response = await CrmLeadService.findLeadsByStageGrouped(params);

  return {
    leads: response.data ?? [],
    error: response.success ? null : response.error,
  };
}

export async function getCrmLeadStageCount(params: {
  organizationId: string;
}): Promise<CrmLeadStageCountResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(
    CACHE_TAGS.crmDashboard,
    CACHE_TAGS.crmLeadsByOrg(params.organizationId),
  );

  const response = await CrmLeadService.countLeadsByStage(params);

  return {
    data: response.data ?? [],
    error: response.success ? null : response.error,
  };
}
