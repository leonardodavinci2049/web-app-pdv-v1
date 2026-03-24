"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { moveLeadStageAction } from "../actions/action-crm-pipeline";

const STAGE_COLORS: Record<string, string> = {
  lead: "bg-blue-500",
  contact: "bg-indigo-500",
  proposal: "bg-amber-500",
  negotiation: "bg-orange-500",
  won: "bg-green-500",
};

interface LeadStageSelectorProps {
  leadId: string;
  currentStageKey: string;
  stages: Array<{
    id: string;
    stageKey: string;
    name: string;
    sortOrder: number;
  }>;
}

export function LeadStageSelector({
  leadId,
  currentStageKey,
  stages,
}: LeadStageSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const sortedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentIndex = sortedStages.findIndex(
    (s) => s.stageKey === currentStageKey,
  );

  function handleStageClick(toStageKey: string) {
    if (toStageKey === currentStageKey || isPending) return;

    startTransition(async () => {
      const result = await moveLeadStageAction({
        leadId,
        fromStageKey: currentStageKey,
        toStageKey,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sortedStages.map((stage, index) => {
        const isCurrent = stage.stageKey === currentStageKey;
        const isPast = index < currentIndex;

        return (
          <Button
            key={stage.id}
            variant={isCurrent ? "default" : "outline"}
            size="sm"
            disabled={isPending || isCurrent}
            onClick={() => handleStageClick(stage.stageKey)}
            className={cn(
              "relative",
              isCurrent && STAGE_COLORS[stage.stageKey],
              isPast && "opacity-60",
            )}
          >
            {stage.name}
          </Button>
        );
      })}
    </div>
  );
}
