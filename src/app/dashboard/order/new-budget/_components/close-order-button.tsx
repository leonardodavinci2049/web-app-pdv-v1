"use client";

import { Loader2, Lock } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { closeOrderAction } from "../actions/close-order-action";

interface CloseOrderButtonProps {
  orderId: number;
}

export function CloseOrderButton({ orderId }: CloseOrderButtonProps) {
  const [state, formAction, isPending] = useActionState(closeOrderAction, null);
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    if (state?.success) {
      toast.success(state.message);
      window.location.reload();
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Lock className="mr-2 h-4 w-4" />
        )}
        Fechar Pedido
      </Button>
    </form>
  );
}
