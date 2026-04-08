"use client";

import {
  Banknote,
  Check,
  FileText,
  Loader2,
  PencilLine,
  Truck,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UIOrderDashboardDetails } from "@/services/api-main/order-sales/transformers/transformers";
import { updateOrderInlineFieldAction } from "../actions/update-order-inline-field-action";

type EditableFieldKey = "VL_FRETE" | "VL_DESCONTO" | "ANOTACOES";

type FormValues = Record<EditableFieldKey, string>;
const EDITABLE_ORDER_STATUS_ID = 22;

const PRICE_FIELDS = [
  {
    key: "VL_FRETE" as const,
    icon: Truck,
    label: "Valor do frete",
    description: "Atualize inline o frete do pedido e salve sem sair da guia.",
  },
  {
    key: "VL_DESCONTO" as const,
    icon: Banknote,
    label: "Valor do desconto",
    description:
      "Ajuste o desconto geral do pedido com persistência imediata por campo.",
  },
] as const;

const ORDER_NOTES = {
  key: "ANOTACOES" as const,
  icon: FileText,
  label: "Anotacoes do pedido",
  description:
    "Edite observacoes operacionais e comerciais diretamente nesta area.",
} as const;

function getFieldValue(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function getInitialValues(details: UIOrderDashboardDetails | null): FormValues {
  return {
    VL_FRETE: getFieldValue(details?.freightValue),
    VL_DESCONTO: getFieldValue(details?.discountValue),
    ANOTACOES: getFieldValue(details?.notes),
  };
}

interface OrderEditInlineFieldsProps {
  details: UIOrderDashboardDetails | null;
}

export function OrderEditInlineFields({ details }: OrderEditInlineFieldsProps) {
  const router = useRouter();
  const [activeField, setActiveField] = useState<EditableFieldKey | null>(null);
  const [pendingField, setPendingField] = useState<EditableFieldKey | null>(
    null,
  );
  const [values, setValues] = useState<FormValues>(() =>
    getInitialValues(details),
  );
  const [isPending, startTransition] = useTransition();

  const initialValues = getInitialValues(details);
  const canEdit = Boolean(
    details?.orderId && details.orderStatusId === EDITABLE_ORDER_STATUS_ID,
  );

  useEffect(() => {
    setValues(getInitialValues(details));
  }, [details]);

  useEffect(() => {
    if (!canEdit) {
      setActiveField(null);
    }
  }, [canEdit]);

  useEffect(() => {
    if (!activeField) return;
    const id =
      activeField === "ANOTACOES"
        ? "order-inline-notes"
        : `order-inline-${activeField.toLowerCase()}`;
    document.getElementById(id)?.focus();
  }, [activeField]);

  function handleValueChange(field: EditableFieldKey, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleEdit(field: EditableFieldKey) {
    if (!canEdit || isPending) {
      return;
    }

    if (activeField && activeField !== field) {
      setValues((currentValues) => ({
        ...currentValues,
        [activeField]: initialValues[activeField],
      }));
    }

    setActiveField(field);
  }

  function handleCancel(field: EditableFieldKey) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: initialValues[field],
    }));
    setActiveField((currentField) =>
      currentField === field ? null : currentField,
    );
  }

  function handleSave(field: EditableFieldKey) {
    if (!details?.orderId) {
      toast.error("Pedido invalido para atualizacao inline");
      return;
    }

    if (!canEdit) {
      toast.error("Somente pedidos em orcamento podem ser editados");
      return;
    }

    startTransition(async () => {
      setPendingField(field);

      try {
        const result = await updateOrderInlineFieldAction(
          details.orderId,
          field,
          values[field],
        );

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setActiveField(null);
        router.refresh();
      } catch (_error) {
        toast.error("Erro inesperado ao atualizar o pedido");
      } finally {
        setPendingField(null);
      }
    });
  }

  function renderActions(field: EditableFieldKey) {
    const isEditing = activeField === field;
    const isSaving = isPending && pendingField === field;

    if (!isEditing) {
      if (!canEdit || isPending) return null;
      return (
        <button
          type="button"
          className="shrink-0 opacity-40 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/order-field:opacity-100"
          onClick={() => handleEdit(field)}
          title="Editar"
        >
          <PencilLine className="h-3 w-3 text-muted-foreground" />
        </button>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaving}
          className="rounded-full"
          onClick={() => handleCancel(field)}
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          className="rounded-full"
          onClick={() => handleSave(field)}
        >
          {isSaving ? (
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
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pb-4 pt-2 md:px-5 md:pb-5 md:pt-3">
      {!canEdit && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-sm text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
          Edicao disponivel apenas quando o pedido estiver no status de
          orcamento.
        </div>
      )}

      <div className="rounded-3xl border border-border/70 bg-background/75 p-3 shadow-sm dark:bg-white/3 md:p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <PencilLine className="h-4 w-4" />
          Frete e desconto
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {PRICE_FIELDS.map((field) => {
            const Icon = field.icon;
            const inputId = `order-inline-${field.key.toLowerCase()}`;
            const isEditing = activeField === field.key;

            return (
              <div
                key={field.key}
                className={cn(
                  "group/order-field rounded-2xl border border-border/70 bg-muted/30 p-3 dark:bg-white/2",
                  isEditing &&
                    "border-primary/40 bg-primary/4 dark:bg-primary/10",
                )}
              >
                <Label
                  htmlFor={inputId}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {field.label}
                </Label>

                <div className="mt-2 flex items-center gap-2">
                  <Input
                    id={inputId}
                    type="text"
                    inputMode="decimal"
                    readOnly={!isEditing}
                    value={values[field.key]}
                    placeholder="Sem valor informado"
                    className="h-10 rounded-xl border-border/70 bg-background/80 text-sm shadow-none dark:bg-background/40"
                    onChange={(event) =>
                      handleValueChange(field.key, event.target.value)
                    }
                  />
                  {!isEditing && renderActions(field.key)}
                </div>
                {isEditing && (
                  <div className="mt-2 flex justify-end">
                    {renderActions(field.key)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-background/75 p-3 shadow-sm dark:bg-white/3 md:p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <FileText className="h-4 w-4" />
          Anotacoes do Orçamento
        </div>

        <div
          className={cn(
            "group/order-field rounded-2xl border border-border/70 bg-muted/30 p-3 dark:bg-white/2",
            activeField === ORDER_NOTES.key &&
              "border-primary/40 bg-primary/4 dark:bg-primary/10",
          )}
        >
          <Textarea
            id="order-inline-notes"
            readOnly={activeField !== ORDER_NOTES.key}
            value={values[ORDER_NOTES.key]}
            placeholder="Sem anotacoes informadas"
            className="mt-1 min-h-24 rounded-xl border-border/70 bg-background/80 text-sm shadow-none dark:bg-background/40"
            onChange={(event) =>
              handleValueChange(ORDER_NOTES.key, event.target.value)
            }
          />
          <div className="mt-2 flex justify-end">
            {renderActions(ORDER_NOTES.key)}
          </div>
        </div>
      </div>
    </div>
  );
}
