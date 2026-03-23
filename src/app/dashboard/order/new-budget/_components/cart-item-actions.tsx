"use client";

import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteItemAction } from "../actions/delete-item-action";
import { updateQuantityAction } from "../actions/update-quantity-action";

interface CartItemActionsProps {
  movementId: number;
  orderId: number;
  productName: string;
  quantity: number;
  storeStock: number;
  variant?: "default" | "mobile";
  showDeleteButton?: boolean;
  showQuantityControls?: boolean;
}

export function CartItemActions({
  movementId,
  orderId,
  productName,
  quantity,
  storeStock,
  variant = "default",
  showDeleteButton = true,
  showQuantityControls = true,
}: CartItemActionsProps) {
  const [isPending, startTransition] = useTransition();

  const isDecrementDisabled = isPending || quantity <= 1;
  const isIncrementDisabled = isPending || quantity >= storeStock;

  function handleQuantityChange(nextQuantity: number) {
    startTransition(async () => {
      const result = await updateQuantityAction(
        movementId,
        orderId,
        nextQuantity,
      );

      if (!result.success) {
        toast.error(result.message);
      }
    });
  }

  function handleIncrement() {
    if (quantity >= storeStock) {
      toast.warning("Estoque insuficiente", {
        description: `${productName} possui no máximo ${storeStock} unidade(s) disponíveis.`,
      });
      return;
    }

    handleQuantityChange(quantity + 1);
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteItemAction(movementId, orderId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        variant === "mobile" && "w-full flex-nowrap justify-between",
        !showDeleteButton && showQuantityControls && "w-full",
        !showQuantityControls && showDeleteButton && "justify-end",
      )}
    >
      {showQuantityControls && (
        <div
          className={cn(
            "flex items-center gap-1 rounded-full border border-border/60 bg-background/90 p-1 dark:bg-white/4",
            variant === "mobile" && "min-w-0 flex-1 justify-between px-1.5",
            variant === "default" &&
              !showDeleteButton &&
              "w-full justify-between px-1.5",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size={variant === "mobile" ? "icon" : "icon-sm"}
            className="rounded-full"
            disabled={isDecrementDisabled}
            onClick={() => handleQuantityChange(quantity - 1)}
            aria-label={`Diminuir quantidade de ${productName}`}
          >
            <Minus className="h-4 w-4" strokeWidth={2.5} />
          </Button>

          <div
            className={cn(
              "text-center text-sm font-semibold text-foreground",
              variant === "mobile" ? "min-w-12" : "min-w-10",
            )}
          >
            {isPending ? (
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            ) : (
              quantity
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size={variant === "mobile" ? "icon" : "icon-sm"}
            className="rounded-full"
            disabled={isIncrementDisabled}
            onClick={handleIncrement}
            aria-label={`Aumentar quantidade de ${productName}`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </Button>
        </div>
      )}

      {showDeleteButton && (
        <Button
          type="button"
          variant="ghost"
          size={variant === "mobile" ? "icon" : "icon-sm"}
          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isPending}
          onClick={handleDelete}
          aria-label={`Remover ${productName} do carrinho`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
