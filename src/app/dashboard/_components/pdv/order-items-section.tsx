import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { UIOrderDashboardItem } from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

interface OrderItemsSectionProps {
  items: UIOrderDashboardItem[];
}

export function OrderItemsSection({ items }: OrderItemsSectionProps) {
  return (
    <Card className="flex-1 p-4 bg-card border-border flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Itens do Pedido</h3>
        <Button variant="secondary" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.movementId}
              className="flex items-center gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.imagePath ? (
                  <Image
                    src={item.imagePath}
                    alt={item.product}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    Sem img
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  {item.product}
                </span>
                {item.label && (
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(Number(item.unitValue))}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <span className="text-sm font-medium text-foreground w-24 text-right">
                {formatCurrency(Number(item.totalValue))}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Nenhum item no carrinho.
          </p>
        </div>
      )}
    </Card>
  );
}
