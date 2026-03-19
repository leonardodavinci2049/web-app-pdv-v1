import { Package } from "lucide-react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";

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
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
            {product.imagePath ? (
              <Image
                src={product.imagePath}
                alt={product.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-md object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {product.ref && <span>Ref: {product.ref}</span>}
              <span>Estoque: {product.storeStock}</span>
              <span className="font-semibold text-foreground">
                R$ {Number(price).toFixed(2)}
              </span>
            </div>
          </div>

          <ProductAddButton
            productId={product.id}
            orderId={orderId}
            customerId={customerId}
          />
        </div>
      </CardContent>
    </Card>
  );
}
