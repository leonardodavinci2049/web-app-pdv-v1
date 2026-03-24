"use client";

import { Circle, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { completeTaskAction } from "../actions/action-crm-tasks";

interface TaskStatusButtonProps {
  taskId: string;
  leadId: string;
}

export function TaskStatusButton({ taskId, leadId }: TaskStatusButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      const result = await completeTaskAction({ taskId, leadId });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  if (isPending) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      className="text-muted-foreground transition-colors hover:text-green-500"
      title="Marcar como concluída"
    >
      <Circle className="h-4 w-4" />
    </button>
  );
}
