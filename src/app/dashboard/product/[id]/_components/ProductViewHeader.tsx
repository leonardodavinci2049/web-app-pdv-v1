import { Badge } from "@/components/ui/badge";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { BackToProductListButton } from "./BackToProductListButton";

interface ProductViewHeaderProps {
  product: UIProductPdv;
}

export function ProductViewHeader({ product }: ProductViewHeaderProps) {
  // Determine stock badge
  let stockBadge = null;
  const stock = product.storeStock ?? 0;
  if (stock > 5) {
    stockBadge = (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        Em Estoque
      </Badge>
    );
  } else if (stock > 0) {
    stockBadge = (
      <Badge
        variant="default"
        className="bg-yellow-600 hover:bg-yellow-700 text-white"
      >
        Estoque Baixo
      </Badge>
    );
  } else {
    stockBadge = <Badge variant="destructive">Sem Estoque</Badge>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <BackToProductListButton />
      </div>
      <div>
        <div className="flex gap-2 mb-2 flex-wrap">
          {stockBadge}
          {product.promotion && (
            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
              Promoção
            </Badge>
          )}
          {product.launch && <Badge variant="secondary">Lançamento</Badge>}
          {product.imported && <Badge variant="outline">Importado</Badge>}
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
          {product.sku && <span>SKU: {product.sku}</span>}
          {product.model && <span>Modelo: {product.model}</span>}
        </div>
      </div>
    </div>
  );
}
