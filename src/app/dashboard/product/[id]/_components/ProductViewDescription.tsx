import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { SafeHtmlContent } from "./SafeHtmlContent";

interface ProductViewDescriptionProps {
  product: UIProductPdv;
}

export function ProductViewDescription({
  product,
}: ProductViewDescriptionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" /> Detalhes do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {product.salesDescription || product.notes ? (
          <>
            {product.salesDescription && (
              <blockquote className="border-l-4 border-primary pl-4 py-1 italic text-muted-foreground">
                {product.salesDescription}
              </blockquote>
            )}

            {product.notes && (
              <SafeHtmlContent
                html={product.notes}
                className="prose-sm sm:prose-base text-sm"
              />
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">
            Nenhuma descrição disponível para este produto.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
