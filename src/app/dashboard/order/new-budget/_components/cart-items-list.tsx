import { ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
}

export function CartItemsList({
  items,
  summary,
  orderId,
  emptyMessage = "Nenhum item adicionado.",
}: CartItemsListProps) {
  const totalUnits = items.reduce(
    (accumulator, item) => accumulator + item.quantity,
    0,
  );

  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Carrinho operacional
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ajuste quantidades e remova itens diretamente daqui.
            </p>
          </div>

          {orderId && (
            <div className="rounded-full border border-border/60 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Pedido #{orderId}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Itens
            </p>
            <p className="text-xl font-semibold text-foreground">
              {items.length}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Unidades
            </p>
            <p className="text-xl font-semibold text-foreground">
              {totalUnits}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <CartItemRow key={item.movementId} item={item} />
              ))}
            </div>

            {summary && (
              <>
                <Separator />
                <div className="space-y-3 rounded-[24px] border border-border/60 bg-background/70 p-4 text-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Resumo parcial
                    </span>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Atualizado em tempo real
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(Number(summary.subtotalValue))}</span>
                  </div>
                  {Number(summary.discountValue) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span>
                      <span>
                        -{formatCurrency(Number(summary.discountValue))}
                      </span>
                    </div>
                  )}
                  {Number(summary.freightValue) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span>
                        {formatCurrency(Number(summary.freightValue))}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>
                      {formatCurrency(Number(summary.totalOrderValue))}
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
