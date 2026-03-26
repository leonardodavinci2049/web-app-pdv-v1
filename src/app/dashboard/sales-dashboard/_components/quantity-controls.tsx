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
    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-0.5">
      <Button
        variant="ghost"
        size="icon-xs"
        className="rounded-full hover:bg-background"
        disabled={isDecrementDisabled}
        onClick={handleDecrement}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </Button>

      <span className="min-w-7 text-center text-sm font-semibold tabular-nums text-foreground">
        {isPending ? "..." : quantity}
      </span>

      <Button
        variant="ghost"
        size="icon-xs"
        className="rounded-full hover:bg-background"
        disabled={isIncrementDisabled}
        onClick={handleIncrement}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </Button>
    </div>
  );
}
