"use client";

import { Loader2, Plus } from "lucide-react";
import Form from "next/form";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createActivityAction } from "../actions/action-crm-activities";

const ACTIVITY_TYPE_OPTIONS = [
  { value: "ligacao", label: "Ligação" },
  { value: "mensagem", label: "Mensagem" },
  { value: "visita", label: "Visita" },
  { value: "anotacao", label: "Anotação" },
  { value: "orcamento", label: "Orçamento" },
  { value: "pedido", label: "Pedido" },
];

interface LeadActivityFormProps {
  leadId: string;
}

export function LeadActivityForm({ leadId }: LeadActivityFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createActivityAction,
    null,
  );
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    if (state?.success) {
      processedRef.current = true;
      toast.success(state.message);
      setOpen(false);
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  useEffect(() => {
    if (open) {
      processedRef.current = false;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Atividade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
        </DialogHeader>

        <Form action={formAction} className="space-y-4">
          <input type="hidden" name="leadId" value={leadId} />

          <div className="space-y-2">
            <Label htmlFor="activityType">Tipo *</Label>
            <Select name="activityType" defaultValue="anotacao">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.activityType && (
              <p className="text-xs text-destructive">
                {state.errors.activityType}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva a atividade..."
              required
              disabled={isPending}
              rows={3}
            />
            {state?.errors?.description && (
              <p className="text-xs text-destructive">
                {state.errors.description}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Atividade
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
