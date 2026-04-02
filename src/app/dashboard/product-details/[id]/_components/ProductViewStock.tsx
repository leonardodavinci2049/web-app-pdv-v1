import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";

interface ProductViewStockProps {
  product: UIProductPdv;
}

export function ProductViewStock({ product }: ProductViewStockProps) {
  const stock = product.storeStock ?? 0;

  let stockStatusClass = "text-muted-foreground";
  let stockStatusText = "Sem Estoque";

  if (stock > 5) {
    stockStatusClass = "text-green-600 dark:text-green-500";
    stockStatusText = "Em Estoque";
  } else if (stock > 0) {
    stockStatusClass = "text-yellow-600 dark:text-yellow-500";
    stockStatusText = "Estoque Baixo";
  } else {
    stockStatusClass = "text-destructive";
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 ${stockStatusClass}`}
          >
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Estoque Atual</div>
            <div className="font-semibold">{stock} unidades</div>
          </div>
        </div>
        <div className={`font-medium ${stockStatusClass}`}>
          {stockStatusText}
        </div>
      </CardContent>
    </Card>
  );
}
