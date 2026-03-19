import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";

import { ProductCard } from "./product-card";

interface ProductListProps {
  products: UIProductPdv[];
  orderId?: number;
  customerId: number;
}

export function ProductList({
  products,
  orderId,
  customerId,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );

  return (
    <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          orderId={orderId}
          customerId={customerId}
        />
      ))}
    </div>
  );
}
