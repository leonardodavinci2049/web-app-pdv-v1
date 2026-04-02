import { Package } from "lucide-react";
import Image from "next/image";

import type { UIOrderDashboardItem } from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

import { CartItemActions } from "./cart-item-actions";

interface CartItemRowProps {
  item: UIOrderDashboardItem;
  variant?: "desktop" | "mobile";
}

export function CartItemRow({ item, variant = "desktop" }: CartItemRowProps) {
  if (variant === "mobile") {
    return (
      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/95 p-3 shadow-sm transition-all hover:border-primary/20 hover:shadow-md dark:bg-card/60">
        <div className="absolute top-3 right-3 z-10">
          <CartItemActions
            movementId={item.movementId}
            orderId={item.orderId}
            productName={item.product}
            quantity={item.quantity}
            storeStock={item.storeStock}
            variant="mobile"
            showQuantityControls={false}
          />
        </div>

        <div className="flex min-w-0 items-start gap-3 pr-8">
          <div className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-muted/20">
            {item.imagePath ? (
              <Image
                src={item.imagePath}
                alt={item.product}
                fill
                sizes="72px"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Package className="h-7 w-7 text-muted-foreground/50" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <p className="line-clamp-3 text-sm font-semibold leading-5 tracking-tight text-foreground">
              {item.product}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {item.ref && (
                <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1">
                  Ref {item.ref}
                </span>
              )}
              {item.sku && (
                <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1">
                  SKU {item.sku}
                </span>
              )}
              <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1 font-semibold">
                {formatCurrency(Number(item.unitValue))}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="max-w-[50%]">
            <CartItemActions
              movementId={item.movementId}
              orderId={item.orderId}
              productName={item.product}
              quantity={item.quantity}
              storeStock={item.storeStock}
              variant="mobile"
              showDeleteButton={false}
            />
          </div>
          <p className="text-base font-bold text-foreground">
            {formatCurrency(Number(item.totalValue))}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-border/40 bg-card p-3 shadow-xs transition-all hover:border-primary/20 hover:shadow-md dark:bg-card/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-muted/20">
            {item.imagePath ? (
              <Image
                src={item.imagePath}
                alt={item.product}
                fill
                sizes="64px"
                className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground/50" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-foreground">
              {item.product}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              {item.ref && (
                <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1">
                  Ref {item.ref}
                </span>
              )}
              {item.sku && (
                <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1">
                  SKU {item.sku}
                </span>
              )}
              <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1 font-semibold">
                {formatCurrency(Number(item.unitValue))}
              </span>
            </div>
          </div>
        </div>

        <CartItemActions
          movementId={item.movementId}
          orderId={item.orderId}
          productName={item.product}
          quantity={item.quantity}
          storeStock={item.storeStock}
          showQuantityControls={false}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="max-w-[50%]">
          <CartItemActions
            movementId={item.movementId}
            orderId={item.orderId}
            productName={item.product}
            quantity={item.quantity}
            storeStock={item.storeStock}
            showDeleteButton={false}
          />
        </div>
        <p className="text-base font-bold text-foreground">
          {formatCurrency(Number(item.totalValue))}
        </p>
      </div>
    </div>
  );
}
