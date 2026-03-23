"use client";

import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { addItemAction } from "../actions/add-item-action";
import { BUDGET_FLOW_STEPS } from "../budget-flow";

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
      toast.success(state.message);
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
    <div className="flex flex-col gap-3 rounded-[24px] border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Quantidade para adicionar
        </p>
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background p-1 shadow-xs">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            disabled={isPending || safeQuantity <= 1}
            onClick={handleDecrement}
            aria-label={`Diminuir quantidade de ${productName}`}
          >
            <Minus className="h-4 w-4" strokeWidth={2.5} />
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
            className="h-9 w-18 border-0 bg-transparent px-0 text-center text-sm shadow-none focus-visible:ring-0"
            disabled={isPending}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            disabled={isPending || safeQuantity >= storeStock}
            onClick={handleIncrement}
            aria-label={`Aumentar quantidade de ${productName}`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>

      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId ?? ""} />
        <input type="hidden" name="customerId" value={customerId} />
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={safeQuantity} />
        <Button
          type="submit"
          size="sm"
          className="w-full rounded-full px-5 sm:w-auto"
          disabled={isPending || storeStock < 1}
          aria-label={`Adicionar ${safeQuantity} unidade(s) de ${productName} ao carrinho`}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adicionando
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Adicionar ao carrinho
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
