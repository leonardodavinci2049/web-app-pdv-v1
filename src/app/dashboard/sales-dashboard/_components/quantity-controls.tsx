"use client";

import { Minus, Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateQuantityAction } from "../actions/update-quantity-action";

interface QuantityControlsProps {
  movementId: number;
  quantity: number;
  storeStock: number;
  disabled: boolean;
}

export function QuantityControls({
  movementId,
  quantity,
  storeStock,
  disabled,
}: QuantityControlsProps) {
  const [isPending, startTransition] = useTransition();

  const isDecrementDisabled = disabled || isPending || quantity <= 1;
  const isIncrementDisabled = disabled || isPending;

  function handleDecrement() {
    startTransition(async () => {
      await updateQuantityAction(movementId, quantity - 1);
    });
  }

  function handleIncrement() {
    if (quantity >= storeStock) {
      toast.warning("Estoque insuficiente", {
        description: `Quantidade máxima disponível: ${storeStock} unidades`,
      });
      return;
    }
    startTransition(async () => {
      await updateQuantityAction(movementId, quantity + 1);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/90 p-2 md:min-w-55 dark:bg-white/4">
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full hover:bg-secondary/80"
        disabled={isDecrementDisabled}
        onClick={handleDecrement}
      >
        <Minus className="h-5 w-5" strokeWidth={3} />
      </Button>

      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Quantidade
        </p>
        <p className="text-lg font-semibold text-foreground">
          {isPending ? "..." : quantity}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full hover:bg-secondary/80"
        disabled={isIncrementDisabled}
        onClick={handleIncrement}
      >
        <Plus className="h-5 w-5" strokeWidth={3} />
      </Button>
    </div>
  );
}
