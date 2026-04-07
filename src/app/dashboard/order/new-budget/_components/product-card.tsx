import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

import { ProductAddButton } from "./product-add-button";
import { ProductDetailDialog } from "./product-detail-dialog";

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
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-xs transition-all hover:shadow-sm dark:bg-zinc-900/80">
      <div className="flex items-start gap-2.5 p-2.5 sm:gap-3 sm:p-3">
        <ProductDetailDialog product={product} />

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {product.name}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              {product.valueType && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {product.valueType}
                </span>
              )}
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(Number(product.productValue))}
              </span>
            </div>
            {product.storeStock > 0 ? (
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                STQ: {product.storeStock}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-red-500 dark:text-red-400">
                Sem Estoque
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 bg-zinc-50/50 px-2.5 py-2 dark:bg-zinc-900/50 sm:px-3">
        <ProductAddButton
          productId={product.id}
          productName={product.name}
          storeStock={product.storeStock}
          orderId={orderId}
          customerId={customerId}
        />
      </div>
    </div>
  );
}
