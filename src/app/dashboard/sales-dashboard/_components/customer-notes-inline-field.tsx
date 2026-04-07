"use client";

import { Check, Loader2, PencilLine, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { updateCustomerNotesAction } from "../actions/update-customer-notes-action";

interface CustomerNotesInlineFieldProps {
  customerId: number;
  orderId: number;
  orderStatusId: number;
  notes: string;
}

const EDITABLE_ORDER_STATUS_ID = 22;

function hasContent(value: string): boolean {
  return value.trim() !== "";
}

export function CustomerNotesInlineField({
  customerId,
  orderId,
  orderStatusId,
  notes,
}: CustomerNotesInlineFieldProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(notes ?? "");
  const [isPending, startTransition] = useTransition();

  const initialValue = notes ?? "";
  const canEdit =
    customerId > 0 && orderId > 0 && orderStatusId === EDITABLE_ORDER_STATUS_ID;

  useEffect(() => {
    setValue(notes ?? "");
  }, [notes]);

  useEffect(() => {
    if (!canEdit) {
      setIsEditing(false);
    }
  }, [canEdit]);

  function handleCancel() {
    setValue(initialValue);
    setIsEditing(false);
  }

  function handleSave() {
    if (!canEdit || isPending) {
      return;
    }

    if (value === initialValue) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateCustomerNotesAction(
          orderId,
          customerId,
          value,
        );

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setIsEditing(false);
        router.refresh();
      } catch (_error) {
        toast.error("Erro inesperado ao atualizar anotacoes do cliente");
      }
    });
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 transition-colors",
        isEditing && "border-primary/40 bg-primary/4 dark:bg-primary/10",
      )}
    >
      {isEditing ? (
        <Textarea
          id="customer-inline-notes"
          value={value}
          placeholder="Nenhuma anotacao cadastrada"
          disabled={isPending}
          className="min-h-28 rounded-xl border-border/70 bg-background/80 text-sm leading-6 shadow-none dark:bg-background/40"
          onChange={(event) => setValue(event.target.value)}
        />
      ) : (
        <div
          className={cn(
            "min-h-24 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-foreground",
            !hasContent(value) && "italic text-muted-foreground/60",
          )}
        >
          {hasContent(value) ? value : "Nenhuma anotacao cadastrada"}
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="rounded-full"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              className="rounded-full"
              onClick={handleSave}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canEdit}
            className="rounded-full"
            onClick={() => setIsEditing(true)}
          >
            <PencilLine className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>
    </div>
  );
}
