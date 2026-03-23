import { ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  UIOrderDashboardItem,
  UIOrderSalesSummary,
} from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

import { CartItemRow } from "./cart-item-row";

interface CartItemsListProps {
  items: UIOrderDashboardItem[];
  summary: UIOrderSalesSummary | null | undefined;
  orderId?: number;
  emptyMessage?: string;
  variant?: "desktop" | "mobile";
}

export function CartItemsList({
  items,
  summary,
  orderId,
  emptyMessage = "Nenhum item adicionado.",
  variant = "desktop",
}: CartItemsListProps) {
  const isMobileVariant = variant === "mobile";

  const headerContent = (
    <>
      <div className="flex items-start justify-between gap-4">
        {orderId && !isMobileVariant && (
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Carrinho
            </CardTitle>
          </div>
        )}
        {orderId && !isMobileVariant && (
          <div className="rounded-full border border-border/60 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Pedido #{orderId}
          </div>
        )}
      </div>
    </>
  );

  const itemsContent =
    items.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    ) : (
      <div
        className={cn(
          "space-y-3",
          !isMobileVariant && "max-h-130 overflow-y-auto",
          isMobileVariant && "space-y-4",
        )}
      >
        {items.map((item) => (
          <CartItemRow key={item.movementId} item={item} variant={variant} />
        ))}
      </div>
    );

  const summaryContent = summary && (
    <div
      className={cn(
        "space-y-3 rounded-3xl border border-border/60 bg-background/70 p-4 text-sm shadow-xs",
        isMobileVariant && "rounded-[28px] bg-card/95 p-5",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          Resumo parcial
        </span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatCurrency(Number(summary.subtotalValue))}</span>
      </div>
      {Number(summary.discountValue) > 0 && (
        <div className="flex justify-between gap-3 text-green-600">
          <span>Desconto</span>
          <span>-{formatCurrency(Number(summary.discountValue))}</span>
        </div>
      )}
      {Number(summary.freightValue) > 0 && (
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Frete</span>
          <span>{formatCurrency(Number(summary.freightValue))}</span>
        </div>
      )}
      <Separator />
      <div className="flex justify-between gap-3 text-base font-semibold">
        <span>Total</span>
        <span>{formatCurrency(Number(summary.totalOrderValue))}</span>
      </div>
    </div>
  );

  if (isMobileVariant) {
    return (
      <div className="space-y-3">
        <section className="rounded-[28px] border border-border/60 bg-card/95 p-3 shadow-sm">
          <div className="space-y-4">{headerContent}</div>
        </section>

        {itemsContent}

        {summaryContent}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="space-y-4 px-4 pt-4 pb-3">
        {headerContent}
      </CardHeader>
      <CardContent className="space-y-4 px-3 pb-4">
        {itemsContent}

        {summary && (
          <>
            <Separator />
            {summaryContent}
          </>
        )}
      </CardContent>
    </Card>
  );
}
