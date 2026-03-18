"use client";

import { Banknote, CreditCard, FileText, Loader2, QrCode } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updatePaymentAction } from "../actions/update-payment-action";

const PAYMENT_METHODS = [
  { id: "1", label: "PIX", icon: QrCode },
  { id: "2", label: "Dinheiro", icon: Banknote },
  { id: "3", label: "Cartão de Crédito", icon: CreditCard },
  { id: "4", label: "Cartão de Débito", icon: CreditCard },
  { id: "5", label: "Boleto", icon: FileText },
];

interface PaymentMethodSelectProps {
  orderId: number;
}

export function PaymentMethodSelect({ orderId }: PaymentMethodSelectProps) {
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

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Selecione a forma de pagamento</Label>
        <Select name="pgMethodId" defaultValue="1">
          <SelectTrigger id="paymentMethod">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <SelectItem key={method.id} value={method.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{method.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={isPending}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Confirmar Pagamento
      </Button>
    </form>
  );
}
