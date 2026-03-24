import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { CrmDealService } from "./crm-deal.service";
import type { CrmDeal, CrmDealStatus } from "./types/crm-deal.types";

export interface CrmDealResult {
  deal: CrmDeal | null;
  error: string | null;
}

export interface CrmDealsResult {
  deals: CrmDeal[];
  error: string | null;
}

export async function getCrmDealByLead(params: {
  leadId: string;
}): Promise<CrmDealResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(CACHE_TAGS.crmDealByLead(params.leadId), CACHE_TAGS.crmDeals);

  const response = await CrmDealService.findDealByLead(params);

  return {
    deal: response.data ?? null,
    error: response.success ? null : response.error,
  };
}

export async function getCrmDealsByOrganization(params: {
  organizationId: string;
  status?: CrmDealStatus;
  limit?: number;
}): Promise<CrmDealsResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(CACHE_TAGS.crmDeals);

  const response = await CrmDealService.findDealsByOrganization(params);

  return {
    deals: response.data ?? [],
    error: response.success ? null : response.error,
  };
}
