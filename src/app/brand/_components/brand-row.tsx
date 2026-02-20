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
  const initial = brand.name ? brand.name.charAt(0).toUpperCase() : "?";

  return (
    <TableRow className="group transition-colors hover:bg-muted/40">
      <TableCell className="font-mono text-xs text-muted-foreground">
        #{brand.id}
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {initial}
          </div>
          <span className="font-medium">{brand.name}</span>
        </div>
      </TableCell>

      <TableCell className="hidden sm:table-cell">
        {brand.slug ? (
          <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {brand.slug}
          </code>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
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
          <BrandUpdateDialog brandId={brand.id} brandName={brand.name} />
          <BrandDeleteDialog brandId={brand.id} brandName={brand.name} />
        </div>
      </TableCell>
    </TableRow>
  );
}
