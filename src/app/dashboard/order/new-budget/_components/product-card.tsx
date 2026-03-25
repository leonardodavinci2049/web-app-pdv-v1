import { Package } from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/card";
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
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border/40 bg-card p-0 gap-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:border-border/50 dark:bg-zinc-900/80 dark:shadow-md dark:backdrop-blur-sm dark:hover:border-primary/40">
      {/* Imagem (Topo) */}
      <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-muted/20 dark:bg-zinc-800/60">
        {product.imagePath ? (
          <Image
            src={product.imagePath}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/40">
            <Package className="mb-2 h-10 w-10" />
            <span className="text-[10px] font-medium uppercase tracking-widest">
              Sem foto
            </span>
          </div>
        )}

        {/* Badges Flutuantes sobre a Imagem */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.storeStock > 0 ? (
            <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-600 ring-1 ring-inset ring-emerald-500/20 backdrop-blur-md dark:bg-emerald-500/20 dark:text-emerald-400">
              Estoque: {product.storeStock}
            </span>
          ) : (
            <span className="inline-flex w-fit items-center rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-red-600 ring-1 ring-inset ring-red-500/20 backdrop-blur-md dark:bg-red-500/20 dark:text-red-400">
              Sem Estoque
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-foreground sm:text-base">
              {product.name}
            </h3>
            {product.model && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                Modelo: {product.model}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {product.ref && (
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                Ref: {product.ref}
              </span>
            )}
            {product.sku && (
              <span className="inline-flex items-center rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground/80">
                SKU: {product.sku}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Preço {product.valueType}
            </p>
            <p className="text-xl font-bold tracking-tight text-foreground">
              {formatCurrency(Number(product.productValue))}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-auto border-t border-border/40 bg-zinc-50/50 p-4 dark:bg-zinc-900/50">
        <ProductAddButton
          productId={product.id}
          productName={product.name}
          storeStock={product.storeStock}
          orderId={orderId}
          customerId={customerId}
        />
      </div>
    </Card>
  );
}
