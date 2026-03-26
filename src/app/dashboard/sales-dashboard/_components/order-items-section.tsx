import { Package, Plus } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UIOrderDashboardItem } from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";
import { AddProductDialog } from "./add-product-dialog";
import { DeleteItemButton } from "./delete-item-button";
import { ItemImagePreview } from "./item-image-preview";
import { QuantityControls } from "./quantity-controls";

const EDITABLE_ORDER_STATUS_ID = 22;

interface OrderItemsSectionProps {
  items: UIOrderDashboardItem[];
  orderStatusId: number;
  orderId: number;
  customerId: number;
  sellerId: number;
  paymentFormId: number;
}

export function OrderItemsSection({
  items,
  orderStatusId,
  orderId,
  customerId,
  sellerId,
  paymentFormId,
}: OrderItemsSectionProps) {
  const isEditable = orderStatusId === EDITABLE_ORDER_STATUS_ID;

  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            Itens do pedido
            <Badge variant="outline" className="rounded-full px-2.5 text-xs">
              {items.length} {items.length === 1 ? "produto" : "produtos"}
            </Badge>
          </CardTitle>

          {isEditable && (
            <AddProductDialog
              orderId={orderId}
              customerId={customerId}
              sellerId={sellerId}
              paymentFormId={paymentFormId}
              orderStatusId={orderStatusId}
            >
              <Button size="sm" className="rounded-full px-4">
                <Plus className="h-4 w-4" />
                Adicionar produto
              </Button>
            </AddProductDialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-2">
            {/* Table header - desktop only */}
            <div className="hidden grid-cols-12 items-center gap-2 text-xs font-medium text-muted-foreground sm:grid">
              <span className="col-span-5">Produto</span>
              <span className="col-span-2 text-center">Qtd</span>
              <span className="col-span-2 text-right">Unit.</span>
              <span
                className={
                  isEditable ? "col-span-2 text-right" : "col-span-3 text-right"
                }
              >
                Total
              </span>
              {isEditable && <span className="col-span-1" />}
            </div>
            <Separator className="hidden sm:block" />

            {items.map((item) => (
              <div
                key={item.movementId}
                className="grid grid-cols-12 items-center gap-x-2 gap-y-2 rounded-lg border p-3 text-sm sm:rounded-none sm:border-0 sm:p-1.5"
              >
                {/* Image + Product name */}
                <div className="col-span-10 flex items-center gap-3 sm:col-span-5">
                  {item.imagePath ? (
                    <ItemImagePreview src={item.imagePath} alt={item.product}>
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/50 sm:h-9 sm:w-9">
                        <Image
                          src={item.imagePath}
                          alt={item.product}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    </ItemImagePreview>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-9 sm:w-9">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="line-clamp-2 text-sm font-medium leading-tight sm:line-clamp-1">
                      {item.product}
                    </span>
                    <span className="text-xs text-muted-foreground sm:hidden">
                      Estoque: {item.storeStock}
                    </span>
                  </div>
                </div>

                {/* Delete button - mobile */}
                {isEditable && (
                  <div className="col-span-2 flex justify-end sm:hidden">
                    <DeleteItemButton
                      movementId={item.movementId}
                      productName={item.product}
                    />
                  </div>
                )}

                {/* Quantity */}
                <div className="col-span-4 sm:col-span-2 sm:flex sm:justify-center">
                  {isEditable ? (
                    <QuantityControls
                      movementId={item.movementId}
                      quantity={item.quantity}
                      storeStock={item.storeStock}
                      disabled={!isEditable}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground sm:text-center">
                      {item.quantity}x
                    </span>
                  )}
                </div>

                {/* Unit price */}
                <span className="col-span-4 text-right text-xs text-muted-foreground sm:col-span-2 sm:text-sm">
                  {formatCurrency(Number(item.unitValue))}
                </span>

                {/* Total */}
                <span
                  className={`text-right text-sm font-medium ${isEditable ? "col-span-4 sm:col-span-2" : "col-span-4 sm:col-span-3"}`}
                >
                  {formatCurrency(Number(item.totalValue))}
                </span>

                {/* Delete button - desktop */}
                {isEditable && (
                  <div className="col-span-1 hidden justify-end sm:flex">
                    <DeleteItemButton
                      movementId={item.movementId}
                      productName={item.product}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Nenhum item no carrinho
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione produtos para montar o pedido.
            </p>
            {isEditable && (
              <AddProductDialog
                orderId={orderId}
                customerId={customerId}
                sellerId={sellerId}
                paymentFormId={paymentFormId}
                orderStatusId={orderStatusId}
              >
                <Button className="mt-4 rounded-full px-4" size="sm">
                  <Plus className="h-4 w-4" />
                  Adicionar primeiro produto
                </Button>
              </AddProductDialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
