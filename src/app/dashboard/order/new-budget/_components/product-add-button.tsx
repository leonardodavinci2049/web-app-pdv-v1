"use client";

import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { addItemAction } from "../actions/add-item-action";
import { BUDGET_FLOW_STEPS } from "../budget-flow";

const ADD_ITEM_SUCCESS_TOAST_DURATION_MS = 1000;

interface ProductAddButtonProps {
  productId: number;
  productName: string;
  storeStock: number;
  orderId?: number;
  customerId: number;
}

export function ProductAddButton({
  productId,
  productName,
  storeStock,
  orderId,
  customerId,
}: ProductAddButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState("1");
  const [state, formAction, isPending] = useActionState(addItemAction, null);
  const prevStateRef = useRef(state);

  const parsedQuantity = Number(quantity);
  const safeQuantity = Number.isFinite(parsedQuantity)
    ? Math.min(Math.max(parsedQuantity, 1), Math.max(storeStock, 1))
    : 1;

  function handleDecrement() {
    setQuantity(String(Math.max(safeQuantity - 1, 1)));
  }

  function handleIncrement() {
    if (safeQuantity >= storeStock) {
      toast.warning("Estoque insuficiente", {
        description: `${productName} possui no máximo ${storeStock} unidade(s) disponíveis.`,
      });
      return;
    }

    setQuantity(String(safeQuantity + 1));
  }

  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    if (state?.success) {
      toast.success(state.message, {
        duration: ADD_ITEM_SUCCESS_TOAST_DURATION_MS,
      });
      setQuantity("1");

      const nextOrderId = Number(state.data?.orderId);
      if (nextOrderId) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("step", String(BUDGET_FLOW_STEPS.cart));
        params.set("customerId", String(customerId));
        params.set("orderId", String(nextOrderId));
        router.replace(`/dashboard/order/new-budget?${params.toString()}`);
      } else {
        router.refresh();
      }
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state, searchParams, customerId, router]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border border-border/50 bg-background/50 p-1 shadow-xs">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-7 w-7 rounded-full bg-background"
          disabled={isPending || safeQuantity <= 1}
          onClick={handleDecrement}
          aria-label={`Diminuir quantidade de ${productName}`}
        >
          <Minus className="h-3 w-3" strokeWidth={2.5} />
        </Button>

        <Input
          type="number"
          inputMode="numeric"
          min="1"
          max={Math.max(storeStock, 1)}
          value={quantity}
          aria-label={`Quantidade de ${productName}`}
          onBlur={() => setQuantity(String(safeQuantity))}
          onChange={(event) => setQuantity(event.target.value)}
          className="h-7 w-12 border-0 bg-transparent px-0 text-center text-sm shadow-none focus-visible:ring-0"
          disabled={isPending}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-7 w-7 rounded-full bg-background"
          disabled={isPending || safeQuantity >= storeStock}
          onClick={handleIncrement}
          aria-label={`Aumentar quantidade de ${productName}`}
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} />
        </Button>
      </div>

      <form action={formAction} className="ml-auto">
        <input type="hidden" name="orderId" value={orderId ?? ""} />
        <input type="hidden" name="customerId" value={customerId} />
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={safeQuantity} />
        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 rounded-xl transition-all active:scale-[0.98]"
          disabled={isPending || storeStock < 1}
          aria-label={`Adicionar ${safeQuantity} unidade(s) de ${productName} ao carrinho`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="relative">
              <ShoppingCart className="h-4 w-4" />
              <Plus
                className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-primary text-primary-foreground"
                strokeWidth={3}
              />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
