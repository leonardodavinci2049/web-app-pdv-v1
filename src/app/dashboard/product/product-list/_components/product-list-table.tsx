"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { ProductDetailDialog } from "@/app/dashboard/order/new-budget/_components/product-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";

interface ProductListTableProps {
  products: UIProductPdv[];
}

function formatPrice(price: string): string {
  if (!price) return "-";
  try {
    const numPrice = parseFloat(price);
    if (Number.isNaN(numPrice)) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  } catch {
    return "-";
  }
}

function getCategoryNames(categories: string | undefined): string {
  if (!categories) return "-";

  try {
    const parsed = JSON.parse(categories);
    if (Array.isArray(parsed)) {
      const names = parsed
        .map((item: Record<string, unknown>) => item.TAXONOMIA)
        .filter(Boolean);
      if (names.length > 0) {
        return names.join(", ");
      }
    }
    return "-";
  } catch {
    return "-";
  }
}

export function ProductListTable({ products }: ProductListTableProps) {
  if (products.length === 0) return null;

  return (
    <>
      {/* Mobile: Card layout */}
      <div className="grid gap-2 px-0 py-2 md:hidden">
        {products.map((product) => (
          <article
            key={product.id}
            className="group min-w-0 overflow-hidden rounded-xl border border-border/50 bg-card p-2.5 shadow-xs transition-all hover:shadow-sm dark:bg-zinc-900/80"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              {/* Product image - click to view details */}
              <ProductDetailDialog product={product} />

              {/* Name, brand, price, stock */}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                  {product.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {product.valueType && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {product.valueType}
                    </span>
                  )}
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(product.retailPrice)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {product.storeStock > 0 ? (
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        product.storeStock < 10
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      Estoque: {product.storeStock}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-red-500 dark:text-red-400">
                      Sem Estoque
                    </span>
                  )}
                  {product.brand && (
                    <>
                      <span className="text-border">·</span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {product.brand}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer: action */}
            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-primary"
                title="Ver detalhes"
              >
                <Link href={`/dashboard/product/${product.id}`}>
                  <Eye className="h-3.5 w-3.5" />
                  Detalhes
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden overflow-x-auto md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Imagem</TableHead>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="w-[250px] max-w-[250px]">
                Categorias
              </TableHead>
              <TableHead className="w-24">Estoque</TableHead>
              <TableHead className="w-24">Varejo</TableHead>
              <TableHead className="w-24">Atacado</TableHead>
              <TableHead className="w-24">Corp.</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <ProductDetailDialog product={product} />
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">
                    #{product.id}
                  </span>
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <div className="space-y-0.5">
                    <p className="font-medium leading-5 text-foreground whitespace-normal wrap-break-word">
                      {product.name}
                    </p>
                    {(product.ref || product.brand || product.type) && (
                      <p className="text-xs leading-5 text-muted-foreground whitespace-normal wrap-break-word">
                        {product.ref && `Ref: ${product.ref}`}
                        {product.ref &&
                          (product.brand || product.type) &&
                          " • "}
                        {product.brand}
                        {product.brand && product.type && " / "}
                        {product.type}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-[250px] max-w-[250px] align-top whitespace-normal">
                  <p
                    className="text-sm leading-5 text-muted-foreground whitespace-normal wrap-break-word"
                    title={getCategoryNames(product.categories)}
                  >
                    {getCategoryNames(product.categories)}
                  </p>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      product.storeStock === 0
                        ? "text-destructive"
                        : product.storeStock < 10
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground",
                    )}
                  >
                    {product.storeStock}
                  </span>
                  {product.storeStock === 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      Ruptura
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {formatPrice(product.retailPrice)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {formatPrice(product.wholesalePrice)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {formatPrice(product.corporatePrice)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Ver detalhes"
                  >
                    <Link href={`/dashboard/product/${product.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
