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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createLeadAction } from "../actions/action-crm-leads";

const SOURCE_OPTIONS = [
  { value: "indicacao", label: "Indicação" },
  { value: "site", label: "Site" },
  { value: "telefone", label: "Telefone" },
  { value: "visita", label: "Visita" },
  { value: "rede_social", label: "Rede Social" },
  { value: "campanha", label: "Campanha" },
  { value: "outros", label: "Outros" },
];

export function CreateLeadDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createLeadAction, null);
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
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>

        <Form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nome do lead"
              required
              disabled={isPending}
              defaultValue={state?.fieldValues?.name}
            />
            {state?.errors?.name && (
              <p className="text-xs text-destructive">{state.errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(00) 00000-0000"
                disabled={isPending}
                defaultValue={state?.fieldValues?.phone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                disabled={isPending}
                defaultValue={state?.fieldValues?.email}
              />
              {state?.errors?.email && (
                <p className="text-xs text-destructive">{state.errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Origem *</Label>
            <Select
              name="source"
              defaultValue={state?.fieldValues?.source || "indicacao"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.source && (
              <p className="text-xs text-destructive">{state.errors.source}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedValue">Valor Estimado</Label>
            <Input
              id="estimatedValue"
              name="estimatedValue"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              disabled={isPending}
              defaultValue={state?.fieldValues?.estimatedValue}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Anotações sobre o lead..."
              disabled={isPending}
              defaultValue={state?.fieldValues?.notes}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Lead
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
