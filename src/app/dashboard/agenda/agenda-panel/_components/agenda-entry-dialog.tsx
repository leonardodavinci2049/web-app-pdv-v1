"use client";

import { CalendarPlus, Loader2, PencilLine } from "lucide-react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { cn } from "@/lib/utils";
import {
  createAgendaEntryAction,
  updateAgendaEntryAction,
} from "../_actions/agenda-actions";
import {
  AGENDA_PRIORITY_OPTIONS,
  AGENDA_STATUS_OPTIONS,
  AGENDA_TYPE_OPTIONS,
  type AgendaPriorityValue,
  type AgendaStatusValue,
  type AgendaTypeValue,
  getNowDateTimeLocalValue,
  getSuggestedAgendaDateTimeLocalValue,
  type SerializedAgendaEntry,
  toDateTimeLocalValue,
} from "./agenda-ui-config";

interface AgendaEntryDialogProps {
  mode: "create" | "update";
  defaultDateKey: string;
  entry?: SerializedAgendaEntry;
}

function isAgendaTypeValue(value?: string): value is AgendaTypeValue {
  return AGENDA_TYPE_OPTIONS.some((option) => option.value === value);
}

function isAgendaStatusValue(value?: string): value is AgendaStatusValue {
  return AGENDA_STATUS_OPTIONS.some((option) => option.value === value);
}

function isAgendaPriorityValue(value?: string): value is AgendaPriorityValue {
  return AGENDA_PRIORITY_OPTIONS.some((option) => option.value === value);
}

export function AgendaEntryDialog({
  mode,
  defaultDateKey,
  entry,
}: AgendaEntryDialogProps) {
  const router = useRouter();
  const fieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const action =
    mode === "create" ? createAgendaEntryAction : updateAgendaEntryAction;
  const [state, formAction, isPending] = useActionState(action, null);
  const [entryType, setEntryType] = useState(entry?.entryType ?? "lembrete");
  const [status, setStatus] = useState(entry?.status ?? "pendente");
  const [priority, setPriority] = useState(entry?.priority ?? "media");
  const titleError = state?.errors?.title;
  const entryTypeError = state?.errors?.entryType;
  const statusError = state?.errors?.status;
  const priorityError = state?.errors?.priority;
  const scheduledAtError = state?.errors?.scheduledAt;
  const notesError = state?.errors?.notes;
  const minScheduledAtValue = getNowDateTimeLocalValue();
  const scheduledAtDefaultValue =
    state?.fieldValues?.scheduledAt ??
    (entry?.scheduledAt
      ? toDateTimeLocalValue(entry.scheduledAt)
      : getSuggestedAgendaDateTimeLocalValue(defaultDateKey));

  const handleEntryTypeChange = (value: string) => {
    setEntryType(value as AgendaTypeValue);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as AgendaStatusValue);
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value as AgendaPriorityValue);
  };

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.success) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setEntryType(entry?.entryType ?? "lembrete");
    setStatus(entry?.status ?? "pendente");
    setPriority(entry?.priority ?? "media");
  }, [entry?.entryType, entry?.priority, entry?.status, open]);

  useEffect(() => {
    if (!state?.errors) {
      return;
    }

    const invalidField = formRef.current?.querySelector<HTMLElement>(
      "[aria-invalid='true']",
    );

    invalidField?.focus();
  }, [state?.errors]);

  useEffect(() => {
    if (!state?.fieldValues) {
      return;
    }

    if (isAgendaTypeValue(state.fieldValues.entryType)) {
      setEntryType(state.fieldValues.entryType);
    }

    if (isAgendaStatusValue(state.fieldValues.status)) {
      setStatus(state.fieldValues.status);
    }

    if (isAgendaPriorityValue(state.fieldValues.priority)) {
      setPriority(state.fieldValues.priority);
    }
  }, [state?.fieldValues]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Novo item
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <PencilLine className="h-4 w-4" />
            Editar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl overflow-y-auto overscroll-contain sm:max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Novo item da agenda"
              : "Editar item da agenda"}
          </DialogTitle>
          <DialogDescription>
            Registre lembretes, tarefas e compromissos com data, hora,
            prioridade e observações.
          </DialogDescription>
        </DialogHeader>

        <Form ref={formRef} action={formAction} className="space-y-4">
          {mode === "update" && entry ? (
            <input type="hidden" name="entryId" value={entry.id} />
          ) : null}

          <input type="hidden" name="entryType" value={entryType} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="priority" value={priority} />

          {state?.message && !state.success ? (
            <div
              aria-live="polite"
              className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {state.message}
            </div>
          ) : (
            <p className="sr-only" aria-live="polite">
              {isPending ? "Salvando alterações…" : ""}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-title`}>Título</Label>
            <Input
              id={`${fieldId}-title`}
              name="title"
              placeholder="Ex.: Confirmar visita comercial…"
              required
              autoComplete="off"
              maxLength={120}
              aria-invalid={Boolean(titleError)}
              aria-describedby={
                titleError ? `${fieldId}-title-error` : undefined
              }
              className={cn(
                titleError &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              defaultValue={state?.fieldValues?.title ?? entry?.title ?? ""}
            />
            {titleError ? (
              <p
                id={`${fieldId}-title-error`}
                className="text-destructive text-sm"
              >
                {titleError}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Use um título curto e acionável para facilitar a leitura na
                lista.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-entry-type`}>Tipo</Label>
              <Select value={entryType} onValueChange={handleEntryTypeChange}>
                <SelectTrigger
                  id={`${fieldId}-entry-type`}
                  className={cn(
                    "w-full",
                    entryTypeError &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  aria-invalid={Boolean(entryTypeError)}
                  aria-describedby={
                    entryTypeError ? `${fieldId}-entry-type-error` : undefined
                  }
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {AGENDA_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {entryTypeError ? (
                <p
                  id={`${fieldId}-entry-type-error`}
                  className="text-destructive text-sm"
                >
                  {entryTypeError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-status`}>Status</Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger
                  id={`${fieldId}-status`}
                  className={cn(
                    "w-full",
                    statusError &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  aria-invalid={Boolean(statusError)}
                  aria-describedby={
                    statusError ? `${fieldId}-status-error` : undefined
                  }
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {AGENDA_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusError ? (
                <p
                  id={`${fieldId}-status-error`}
                  className="text-destructive text-sm"
                >
                  {statusError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-priority`}>Prioridade</Label>
              <Select value={priority} onValueChange={handlePriorityChange}>
                <SelectTrigger
                  id={`${fieldId}-priority`}
                  className={cn(
                    "w-full",
                    priorityError &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  aria-invalid={Boolean(priorityError)}
                  aria-describedby={
                    priorityError ? `${fieldId}-priority-error` : undefined
                  }
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {AGENDA_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {priorityError ? (
                <p
                  id={`${fieldId}-priority-error`}
                  className="text-destructive text-sm"
                >
                  {priorityError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-scheduledAt`}>Data e hora</Label>
            <Input
              id={`${fieldId}-scheduledAt`}
              name="scheduledAt"
              type="datetime-local"
              min={minScheduledAtValue}
              required
              autoComplete="off"
              aria-invalid={Boolean(scheduledAtError)}
              aria-describedby={
                scheduledAtError ? `${fieldId}-scheduledAt-error` : undefined
              }
              className={cn(
                scheduledAtError &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              defaultValue={scheduledAtDefaultValue}
            />
            {scheduledAtError ? (
              <p
                id={`${fieldId}-scheduledAt-error`}
                className="text-destructive text-sm"
              >
                {scheduledAtError}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Aceita apenas horários futuros para evitar itens vencidos no
                cadastro.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-notes`}>Observações</Label>
            <Textarea
              id={`${fieldId}-notes`}
              name="notes"
              placeholder="Anote contexto, responsável ou próximos passos…"
              autoComplete="off"
              maxLength={1000}
              aria-invalid={Boolean(notesError)}
              aria-describedby={
                notesError ? `${fieldId}-notes-error` : undefined
              }
              className={cn(
                "min-h-28",
                notesError &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              defaultValue={state?.fieldValues?.notes ?? entry?.notes ?? ""}
            />
            {notesError ? (
              <p
                id={`${fieldId}-notes-error`}
                className="text-destructive text-sm"
              >
                {notesError}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Fechar
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isPending
                ? "Salvando…"
                : mode === "create"
                  ? "Salvar item"
                  : "Atualizar item"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
