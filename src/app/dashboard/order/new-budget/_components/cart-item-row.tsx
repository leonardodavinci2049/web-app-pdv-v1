import { Package } from "lucide-react";
import Image from "next/image";

import type { UIOrderDashboardItem } from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

import { CartItemActions } from "./cart-item-actions";

interface CartItemRowProps {
  item: UIOrderDashboardItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-border/40 bg-card p-3 shadow-xs transition-all hover:border-primary/20 hover:shadow-md dark:bg-card/40">
      <div className="flex items-start gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-muted/20">
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

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-foreground">
                {item.product}
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.ref && (
                  <span className="rounded-md bg-secondary/50 px-1.5 py-0.5">
                    Ref {item.ref}
                  </span>
                )}
                {item.sku && (
                  <span className="rounded-md bg-secondary/50 px-1.5 py-0.5">
                    SKU {item.sku}
                  </span>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Total
              </p>
              <p className="text-base font-bold text-foreground">
                {formatCurrency(Number(item.totalValue))}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-secondary/20 p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">
                Unitário:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(Number(item.unitValue))}
                </span>
              </span>
              <span className="text-muted-foreground">
                Subtotal:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(Number(item.subtotalValue))}
                </span>
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Qtd
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {item.quantity} un
                </p>
              </div>

              <CartItemActions
                movementId={item.movementId}
                orderId={item.orderId}
                productName={item.product}
                quantity={item.quantity}
                storeStock={item.storeStock}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
