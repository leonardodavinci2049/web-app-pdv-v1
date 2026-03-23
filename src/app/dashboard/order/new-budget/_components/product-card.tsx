import { Package } from "lucide-react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

import { ProductAddButton } from "./product-add-button";

interface ProductCardProps {
  product: UIProductPdv;
  orderId?: number;
  customerId: number;
}

export function ProductCard({
  product,
  orderId,
  customerId,
}: ProductCardProps) {
  const price =
    product.retailPrice !== "0.000000"
      ? product.retailPrice
      : product.wholesalePrice;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/60">
            {product.imagePath ? (
              <Image
                src={product.imagePath}
                alt={product.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <Package className="h-7 w-7 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <p className="line-clamp-2 text-base font-semibold text-foreground">
                {product.name}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {product.ref && <span>Ref {product.ref}</span>}
                {product.sku && <span>SKU {product.sku}</span>}
                {product.label && <span>Etiqueta {product.label}</span>}
              </div>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-border/60 bg-muted/20 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-background px-3 py-1 font-medium text-foreground shadow-xs">
                  Estoque loja: {product.storeStock}
                </span>
                {product.model && (
                  <span className="rounded-full bg-background px-3 py-1 shadow-xs">
                    Modelo: {product.model}
                  </span>
                )}
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Preço de venda
                </p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(Number(price))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ProductAddButton
          productId={product.id}
          productName={product.name}
          storeStock={product.storeStock}
          orderId={orderId}
          customerId={customerId}
        />
      </CardContent>
    </Card>
  );
}
