"use client";

import {
  Banknote,
  Building2,
  Check,
  CreditCard,
  FileText,
  Loader2,
  QrCode,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { updatePaymentAction } from "../actions/update-payment-action";

const PAYMENT_METHODS = [
  { id: "1", label: "Dinheiro", icon: Banknote },
  { id: "2", label: "PIX", icon: QrCode },
  { id: "3", label: "Cartão Débito", icon: CreditCard },
  { id: "4", label: "Cartão Crédito", icon: CreditCard },
  { id: "5", label: "Depósito", icon: Building2 },
  { id: "7", label: "Boleto", icon: FileText },
];

interface PaymentMethodSelectProps {
  orderId: number;
  defaultValue?: string;
}

export function PaymentMethodSelect({
  orderId,
  defaultValue = "1",
}: PaymentMethodSelectProps) {
  const [selected, setSelected] = useState(defaultValue);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    updatePaymentAction,
    null,
  );
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    if (state?.success) {
      toast.success(state.message);
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  function handleSelect(id: string) {
    if (isPending || id === selected) return;
    setSelected(id);
    // Submit automatically on next tick so the hidden input value is updated
    setTimeout(() => formRef.current?.requestSubmit(), 0);
  }

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="pgMethodId" value={selected} />

      <fieldset disabled={isPending} className="space-y-3">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isActive = selected === method.id;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => handleSelect(method.id)}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "border-primary bg-primary/10 text-primary shadow-sm dark:bg-primary/15"
                    : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent/50",
                )}
              >
                {isActive && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  </span>
                )}

                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-medium leading-tight",
                    isActive ? "text-primary" : "",
                  )}
                >
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>

        {isPending && (
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Atualizando...</span>
          </div>
        )}
      </fieldset>
    </form>
  );
}
