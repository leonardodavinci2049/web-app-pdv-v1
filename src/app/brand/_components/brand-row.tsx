import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandDeleteDialog } from "./brand-delete-dialog";
import { BrandImageCell } from "./brand-image-cell";
import { BrandUpdateDialog } from "./brand-update-dialog";

interface BrandRowProps {
  brand: UIBrand;
}

export function BrandRow({ brand }: BrandRowProps) {
  return (
    <TableRow className="group transition-colors hover:bg-muted/40">
      <TableCell className="font-mono text-xs text-muted-foreground">
        #{brand.id}
      </TableCell>

      <TableCell>
        <BrandImageCell imagePath={brand.imagePath} brandName={brand.name} />
      </TableCell>

      <TableCell>
        <span className="font-medium">{brand.name}</span>
      </TableCell>

      <TableCell>
        <Badge
          variant={brand.inactive ? "secondary" : "default"}
          className={
            brand.inactive
              ? "text-xs"
              : "bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
          }
        >
          {brand.inactive ? "Inativa" : "Ativa"}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 opacity-60 transition-opacity group-hover:opacity-100"
          >
            <Link href={`/brand/${brand.id}`}>
              <SquareArrowOutUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <BrandUpdateDialog brand={brand} />
          <BrandDeleteDialog brandId={brand.id} brandName={brand.name} />
        </div>
      </TableCell>
    </TableRow>
  );
}
