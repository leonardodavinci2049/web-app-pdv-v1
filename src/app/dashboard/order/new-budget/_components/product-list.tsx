import { PackageSearch } from "lucide-react";
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
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border border-dashed border-border/70 bg-muted/15 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PackageSearch className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">
            Nenhum produto encontrado
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            Ajuste o termo da busca ou limpe os filtros para visualizar mais
            itens disponíveis para o cliente.
          </p>
        </div>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );

  return (
    <div className="pb-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            orderId={orderId}
            customerId={customerId}
          />
        ))}
      </div>
    </div>
  );
}
