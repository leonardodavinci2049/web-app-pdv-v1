import { FolderTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIProductPdvRelatedCategory } from "@/services/api-main/product-pdv/transformers/transformers";

interface ProductViewCategoriesProps {
  categories: UIProductPdvRelatedCategory[];
}

export function ProductViewCategories({
  categories,
}: ProductViewCategoriesProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <FolderTree className="w-4 h-4" /> Categorias
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            Nenhuma categoria associada
          </span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.taxonomyId}
                variant="secondary"
                className="font-normal"
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
