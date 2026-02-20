"use client";

import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandDeleteDialog } from "./brand-delete-dialog";
import { BrandUpdateDialog } from "./brand-update-dialog";

interface BrandRowProps {
  brand: UIBrand;
}

export function BrandRow({ brand }: BrandRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{brand.id}</TableCell>
      <TableCell>{brand.name}</TableCell>
      {/* 
          Since BrandListItem doesn't return slug/status, we can't show them properly in the list.
          I will comment them out or show placeholders if I update the TableHeader.
          Wait, I can just not render them if I remove columns from BrandList.
          But for now let's keep the row consistent with BrandList.
          BrandList has columns: ID, Nome, Slug, Status, Ações.
          I will render empty/default if missing.
       */}
      <TableCell className="text-muted-foreground">
        {brand.slug || "-"}
      </TableCell>
      <TableCell>
        <Badge variant={brand.inactive ? "secondary" : "default"}>
          {brand.inactive ? "Inativo" : "Ativo"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/brand/${brand.id}`}>
              <SquareArrowOutUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <BrandUpdateDialog brandId={brand.id} brandName={brand.name} />
          <BrandDeleteDialog brandId={brand.id} brandName={brand.name} />
        </div>
      </TableCell>
    </TableRow>
  );
}
