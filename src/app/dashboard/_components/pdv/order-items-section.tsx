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
    <Card className="flex-1 p-3 sm:p-4 bg-card border-border flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Itens do Pedido</h3>
        <Button variant="secondary" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card
              key={item.movementId}
              className="group relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-2.5 sm:p-3 shadow-md hover:shadow-lg transition-all border-border/60 bg-card"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 z-10 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="flex flex-1 items-start gap-3 pr-8 sm:pr-2">
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
                    <div className="flex h-full w-full items-center justify-center bg-secondary/50 p-1 text-center text-xs text-muted-foreground">
                      Sem img
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-center min-h-[4rem] gap-0.5">
                  <span className="text-sm font-semibold text-foreground line-clamp-2">
                    {item.product}
                  </span>
                  {item.label && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {item.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-2 sm:gap-4 mt-1 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-border">
                <div className="flex items-center gap-1 rounded-md border border-border/50 bg-secondary/20 p-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:bg-secondary/60">
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:bg-secondary/60">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <span className="text-sm font-bold text-foreground flex-1 sm:flex-none text-right sm:w-28 truncate pr-1">
                  {formatCurrency(Number(item.totalValue))}
                </span>
              </div>
            </Card>
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
