import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { CrmStageService } from "./crm-stage.service";
import type { CrmStage } from "./types/crm-stage.types";

export interface CrmStagesResult {
  stages: CrmStage[];
  error: string | null;
}

export async function getCrmActiveStages(): Promise<CrmStagesResult> {
  "use cache";

  cacheLife("hours");
  cacheTag(CACHE_TAGS.crmStages);

  const response = await CrmStageService.findAllActiveStages();

  return {
    stages: response.data ?? [],
    error: response.success ? null : response.error,
  };
}
