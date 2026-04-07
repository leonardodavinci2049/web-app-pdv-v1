"use client";

import { Check, Loader2, PencilLine, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { updateCustomerInlineFieldAction } from "../actions/update-customer-inline-field-action";

type EditableCustomerFieldKey =
  | "customerName"
  | "phone"
  | "whatsapp"
  | "email"
  | "cpf"
  | "rg"
  | "companyName"
  | "tradeName"
  | "cnpj";

type CustomerInlineTextFieldProps = {
  customerId: number;
  orderId: number;
  orderStatusId: number;
  isEditable?: boolean;
  field: EditableCustomerFieldKey;
  value: string;
  displayValue?: string;
  emptyText?: string;
  variant?: "default" | "title";
  className?: string;
};

const EDITABLE_ORDER_STATUS_ID = 22;

const FIELD_CONFIG = {
  customerName: {
    inputMode: "text" as const,
    maxLength: 200,
    autoComplete: "name",
  },
  phone: {
    inputMode: "tel" as const,
    maxLength: 15,
    autoComplete: "tel",
  },
  whatsapp: {
    inputMode: "tel" as const,
    maxLength: 15,
    autoComplete: "tel",
  },
  email: {
    inputMode: "email" as const,
    maxLength: 200,
    autoComplete: "email",
  },
  cpf: {
    inputMode: "numeric" as const,
    maxLength: 14,
    autoComplete: "off",
  },
  rg: {
    inputMode: "text" as const,
    maxLength: 50,
    autoComplete: "off",
  },
  companyName: {
    inputMode: "text" as const,
    maxLength: 200,
    autoComplete: "organization",
  },
  tradeName: {
    inputMode: "text" as const,
    maxLength: 200,
    autoComplete: "organization",
  },
  cnpj: {
    inputMode: "numeric" as const,
    maxLength: 18,
    autoComplete: "off",
  },
} as const;

function hasContent(value: string | null | undefined): boolean {
  return (value ?? "").trim() !== "";
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCpfInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length > 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length > 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  if (digits.length > 3) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  return digits;
}

function formatCnpjInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length > 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }

  if (digits.length > 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  if (digits.length > 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }

  if (digits.length > 2) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return digits;
}

function formatPhoneInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length > 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length > 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length > 2) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return digits;
}

function formatInputValue(
  field: EditableCustomerFieldKey,
  value: string,
): string {
  switch (field) {
    case "phone":
    case "whatsapp":
      return formatPhoneInput(value);
    case "cpf":
      return formatCpfInput(value);
    case "cnpj":
      return formatCnpjInput(value);
    default:
      return value;
  }
}

function normalizeValue(
  field: EditableCustomerFieldKey,
  value: string,
): string {
  switch (field) {
    case "phone":
    case "whatsapp":
    case "cpf":
    case "cnpj":
      return onlyDigits(value);
    default:
      return value.trim();
  }
}

export function CustomerInlineTextField({
  customerId,
  orderId,
  orderStatusId,
  isEditable = true,
  field,
  value,
  displayValue,
  emptyText = "Nao informado",
  variant = "default",
  className,
}: CustomerInlineTextFieldProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(() =>
    formatInputValue(field, value ?? ""),
  );
  const [isPending, startTransition] = useTransition();

  const canEdit =
    isEditable &&
    customerId > 0 &&
    orderId > 0 &&
    orderStatusId === EDITABLE_ORDER_STATUS_ID;
  const config = FIELD_CONFIG[field];
  const normalizedInitialValue = normalizeValue(field, value ?? "");
  const hasCurrentValue = hasContent(value);

  useEffect(() => {
    setInputValue(formatInputValue(field, value ?? ""));
  }, [field, value]);

  useEffect(() => {
    if (!canEdit) {
      setIsEditing(false);
    }
  }, [canEdit]);

  function handleCancel() {
    setInputValue(formatInputValue(field, value ?? ""));
    setIsEditing(false);
  }

  function handleSave() {
    if (!canEdit || isPending) {
      return;
    }

    const normalizedValue = normalizeValue(field, inputValue);

    if (normalizedValue === normalizedInitialValue) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateCustomerInlineFieldAction(
          orderId,
          customerId,
          field,
          normalizedValue,
        );

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setIsEditing(false);
        router.refresh();
      } catch (_error) {
        toast.error("Erro inesperado ao atualizar campo do cliente");
      }
    });
  }

  function renderActions() {
    if (!isEditing) {
      return (
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
      );
    }

    return (
      <div className="flex flex-col gap-2 sm:flex-row">
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
      </div>
    );
  }

  if (variant === "title") {
    return (
      <div className={cn("space-y-3", className)}>
        {isEditing ? (
          <Input
            value={inputValue}
            inputMode={config.inputMode}
            autoComplete={config.autoComplete}
            maxLength={config.maxLength}
            disabled={isPending}
            className="h-11 rounded-2xl border-border/70 bg-background/80 text-lg font-semibold tracking-tight shadow-none md:text-xl dark:bg-background/40"
            onChange={(event) =>
              setInputValue(formatInputValue(field, event.target.value))
            }
          />
        ) : (
          <h4
            className={cn(
              "text-xl font-semibold tracking-tight text-foreground md:text-2xl",
              !hasCurrentValue && "italic text-muted-foreground/60",
            )}
          >
            {hasCurrentValue ? (displayValue ?? value) : emptyText}
          </h4>
        )}

        <div className="flex flex-wrap gap-2">{renderActions()}</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {isEditing ? (
        <Input
          value={inputValue}
          inputMode={config.inputMode}
          autoComplete={config.autoComplete}
          maxLength={config.maxLength}
          disabled={isPending}
          className="h-10 rounded-xl border-border/70 bg-background/80 text-sm font-medium shadow-none dark:bg-background/40"
          onChange={(event) =>
            setInputValue(formatInputValue(field, event.target.value))
          }
        />
      ) : (
        <p
          className={cn(
            "text-sm font-medium text-foreground",
            (field === "cpf" || field === "cnpj" || field === "rg") &&
              "font-mono tracking-wide",
            !hasCurrentValue && "italic text-muted-foreground/60",
          )}
        >
          {hasCurrentValue ? (displayValue ?? value) : emptyText}
        </p>
      )}

      <div className="flex flex-wrap gap-2">{renderActions()}</div>
    </div>
  );
}
