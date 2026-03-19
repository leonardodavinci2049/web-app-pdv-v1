"use client";

import {
  CheckCheck,
  ClockArrowUp,
  Loader2,
  PauseCircle,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteAgendaEntryAction,
  setAgendaEntryStatusAction,
} from "../_actions/agenda-actions";
import type { SerializedAgendaEntry } from "./agenda-ui-config";

interface AgendaEntryQuickActionsProps {
  entry: SerializedAgendaEntry;
}

export function AgendaEntryQuickActions({
  entry,
}: AgendaEntryQuickActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentAction, setCurrentAction] = useState<
    SerializedAgendaEntry["status"] | "delete" | null
  >(null);

  const runStatusAction = (status: SerializedAgendaEntry["status"]) => {
    setCurrentAction(status);

    startTransition(async () => {
      try {
        const result = await setAgendaEntryStatusAction({
          entryId: entry.id,
          status,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } finally {
        setCurrentAction(null);
      }
    });
  };

  const runDeleteAction = () => {
    if (!window.confirm("Deseja realmente remover este item da agenda?")) {
      return;
    }

    setCurrentAction("delete");

    startTransition(async () => {
      try {
        const result = await deleteAgendaEntryAction(entry.id);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } finally {
        setCurrentAction(null);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="sr-only" aria-live="polite">
        {isPending && currentAction === "concluido"
          ? "Marcando item como concluído…"
          : ""}
        {isPending && currentAction === "em_andamento"
          ? "Atualizando item para em andamento…"
          : ""}
        {isPending && currentAction === "adiado"
          ? "Adiado item da agenda…"
          : ""}
        {isPending && currentAction === "delete"
          ? "Excluindo item da agenda…"
          : ""}
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending || entry.status === "concluido"}
        onClick={() => runStatusAction("concluido")}
      >
        {isPending && currentAction === "concluido" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCheck className="h-4 w-4" />
        )}
        Concluir
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending || entry.status === "em_andamento"}
        onClick={() => runStatusAction("em_andamento")}
      >
        {isPending && currentAction === "em_andamento" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ClockArrowUp className="h-4 w-4" />
        )}
        Iniciar
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending || entry.status === "adiado"}
        onClick={() => runStatusAction("adiado")}
      >
        {isPending && currentAction === "adiado" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PauseCircle className="h-4 w-4" />
        )}
        Adiar
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700"
        disabled={isPending}
        onClick={runDeleteAction}
      >
        {isPending && currentAction === "delete" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Excluir
      </Button>
    </div>
  );
}
