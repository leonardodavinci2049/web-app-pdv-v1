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
    <div className="rounded-[24px] border border-border/60 bg-background/80 p-3 shadow-xs transition-colors hover:bg-accent/30">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/60">
          {item.imagePath ? (
            <Image
              src={item.imagePath}
              alt={item.product}
              width={56}
              height={56}
              className="h-14 w-14 rounded-2xl object-cover"
            />
          ) : (
            <Package className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="line-clamp-2 text-sm font-semibold text-foreground">
                {item.product}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {item.ref && <span>Ref {item.ref}</span>}
                {item.sku && <span>SKU {item.sku}</span>}
                <span>Estoque {item.storeStock}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Total do item
              </p>
              <p className="text-base font-semibold text-foreground">
                {formatCurrency(Number(item.totalValue))}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                Unitário {formatCurrency(Number(item.unitValue))}
              </span>
              <span className="font-medium text-foreground">
                Subtotal {formatCurrency(Number(item.subtotalValue))}
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Quantidade atual
                </p>
                <p className="text-sm font-medium text-foreground">
                  {item.quantity} unidade(s)
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
