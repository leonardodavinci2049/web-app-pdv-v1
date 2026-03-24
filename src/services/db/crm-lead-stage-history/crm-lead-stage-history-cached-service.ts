import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { CrmLeadStageHistoryService } from "./crm-lead-stage-history.service";
import type { CrmLeadStageHistory } from "./types/crm-lead-stage-history.types";

export interface CrmLeadStageHistoryResult {
  history: CrmLeadStageHistory[];
  error: string | null;
}

export async function getCrmLeadStageHistory(params: {
  leadId: string;
}): Promise<CrmLeadStageHistoryResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(CACHE_TAGS.crmLeadStageHistory(params.leadId));

  const response = await CrmLeadStageHistoryService.findHistoryByLead(params);

  return {
    history: response.data ?? [],
    error: response.success ? null : response.error,
  };
}
