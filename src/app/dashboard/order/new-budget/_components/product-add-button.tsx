"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { addItemAction } from "../actions/add-item-action";

interface ProductAddButtonProps {
  productId: number;
  orderId?: number;
  customerId: number;
}

export function ProductAddButton({
  productId,
  orderId,
  customerId,
}: ProductAddButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState("1");
  const [state, formAction, isPending] = useActionState(addItemAction, null);
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    if (state?.success) {
      toast.success(state.message);
      setQuantity("1");

      const nextOrderId = Number(state.data?.orderId);
      if (nextOrderId) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("step", "3");
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
    <div className="flex shrink-0 items-center gap-1">
      <Input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="h-8 w-16 text-center text-xs"
        disabled={isPending}
      />
      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId ?? ""} />
        <input type="hidden" name="customerId" value={customerId} />
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={quantity} />
        <Button
          type="submit"
          size="icon"
          variant="outline"
          className="h-8 w-8"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
