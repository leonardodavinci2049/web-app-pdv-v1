import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { CrmActivityService } from "./crm-activity.service";
import type { CrmActivity } from "./types/crm-activity.types";

export interface CrmActivitiesResult {
  activities: CrmActivity[];
  error: string | null;
}

export async function getCrmActivitiesByLead(params: {
  leadId: string;
  limit?: number;
}): Promise<CrmActivitiesResult> {
  "use cache";

  cacheLife("frequent");
  cacheTag(
    CACHE_TAGS.crmActivitiesByLead(params.leadId),
    CACHE_TAGS.crmActivities,
  );

  const response = await CrmActivityService.findActivitiesByLead(params);

  return {
    activities: response.data ?? [],
    error: response.success ? null : response.error,
  };
}
