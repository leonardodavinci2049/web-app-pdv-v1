"use client";

import { MoreHorizontal, Trophy, XCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  markLeadAsLostAction,
  markLeadAsWonAction,
} from "../actions/action-crm-pipeline";

interface LeadActionsProps {
  leadId: string;
  currentStageKey: string;
}

export function LeadActions({ leadId, currentStageKey }: LeadActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");

  function handleMarkAsWon() {
    startTransition(async () => {
      const result = await markLeadAsWonAction({ leadId });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleMarkAsLost() {
    startTransition(async () => {
      const result = await markLeadAsLostAction({
        leadId,
        lostReason: lostReason || undefined,
      });
      if (result.success) {
        toast.success(result.message);
        setLostDialogOpen(false);
        setLostReason("");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleMarkAsWon}
            disabled={currentStageKey === "won"}
          >
            <Trophy className="mr-2 h-4 w-4 text-green-500" />
            Marcar como Ganho
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLostDialogOpen(true)}
            disabled={currentStageKey === "lost"}
            className="text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Marcar como Perdido
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={lostDialogOpen} onOpenChange={setLostDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como Perdido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lostReason">Motivo da perda</Label>
              <Textarea
                id="lostReason"
                placeholder="Descreva o motivo..."
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setLostDialogOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleMarkAsLost}
                disabled={isPending}
              >
                Confirmar Perda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
