import { FolderTree } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductRelatedTaxonomy } from "@/services/api/product/types/product-types";
import { AddCategoryDialog } from "./AddCategoryDialog";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

interface ProductCategoriesCardProps {
  relatedTaxonomies: ProductRelatedTaxonomy[];
  productId: number;
}

/**
 * ProductCategoriesCard Component
 *
 * Displays product related categories in a table format.
 * Shows a message when no categories are defined.
 * Allows adding and deleting category relationships.
 */
export function ProductCategoriesCard({
  relatedTaxonomies,
  productId,
}: ProductCategoriesCardProps) {
  const hasTaxonomies = relatedTaxonomies.length > 0;
  const existingCategoryIds = relatedTaxonomies.map((t) => t.ID_TAXONOMY);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categorias Relacionadas
          </CardTitle>
          <AddCategoryDialog
            productId={productId}
            existingCategoryIds={existingCategoryIds}
          />
        </div>
      </CardHeader>
      <CardContent>
        {hasTaxonomies ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nome da Categoria</TableHead>
                  <TableHead className="w-[80px] text-center">Nível</TableHead>
                  <TableHead className="w-[80px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedTaxonomies.map((taxonomy) => (
                  <TableRow key={taxonomy.ID_TAXONOMY}>
                    <TableCell className="font-medium">
                      {taxonomy.ID_TAXONOMY}
                    </TableCell>
                    <TableCell>{taxonomy.TAXONOMIA}</TableCell>
                    <TableCell className="text-center">
                      {taxonomy.LEVEL ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <DeleteCategoryButton
                        taxonomyId={taxonomy.ID_TAXONOMY}
                        taxonomyName={taxonomy.TAXONOMIA}
                        productId={productId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground italic text-sm">
            Nenhuma categoria relacionada
          </p>
        )}
      </CardContent>
    </Card>
  );
}
