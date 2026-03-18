import { ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  UIOrderDashboardItem,
  UIOrderSalesSummary,
} from "@/services/api-main/order-sales/transformers/transformers";

import { CartItemRow } from "./cart-item-row";

interface CartItemsListProps {
  items: UIOrderDashboardItem[];
  summary: UIOrderSalesSummary | null | undefined;
}

export function CartItemsList({ items, summary }: CartItemsListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-4 w-4" />
          Carrinho
          {items.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({items.length} {items.length === 1 ? "item" : "itens"})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhum item adicionado.
          </p>
        ) : (
          <>
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {items.map((item) => (
                <CartItemRow key={item.movementId} item={item} />
              ))}
            </div>

            {summary && (
              <>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {Number(summary.subtotalValue).toFixed(2)}</span>
                  </div>
                  {Number(summary.discountValue) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span>
                      <span>
                        -R$ {Number(summary.discountValue).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {Number(summary.freightValue) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span>R$ {Number(summary.freightValue).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>R$ {Number(summary.totalOrderValue).toFixed(2)}</span>
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
