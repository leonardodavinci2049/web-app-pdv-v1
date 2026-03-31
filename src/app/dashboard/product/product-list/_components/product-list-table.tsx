"use client";

import { Eye, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

function truncateCategories(
  categories: string | undefined,
  maxLength = 50,
): string {
  const categoryNames = getCategoryNames(categories);
  if (categoryNames === "-") return "-";
  if (categoryNames.length <= maxLength) return categoryNames;
  return `${categoryNames.substring(0, maxLength)}...`;
}

export function ProductListTable({ products }: ProductListTableProps) {
  if (products.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Imagem</TableHead>
          <TableHead className="w-[120px]">ID / SKU</TableHead>
          <TableHead className="w-[400px]">Produto</TableHead>
          <TableHead className="w-[150px]">Marca / Tipo</TableHead>
          <TableHead className="w-[300px]">Categorias</TableHead>
          <TableHead className="w-[100px]">Estoque</TableHead>
          <TableHead className="w-[120px]">Preço</TableHead>
          <TableHead className="w-[100px] text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="relative h-12 w-12 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                {product.imagePath ? (
                  <Image
                    src={product.imagePath}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-0.5">
                <span className="font-mono text-xs text-muted-foreground block">
                  #{product.id}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  SKU: {product.sku}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">{product.name}</p>
                {(product.ref || product.label) && (
                  <p className="text-xs text-muted-foreground">
                    {product.ref && `Ref: ${product.ref}`}
                    {product.ref && product.label && " • "}
                    {product.label && product.label}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-0.5">
                <p className="text-sm">{product.brand}</p>
                {product.type && (
                  <p className="text-xs text-muted-foreground">
                    {product.type}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <p
                className="text-sm text-muted-foreground truncate"
                title={getCategoryNames(product.categories)}
              >
                {truncateCategories(product.categories)}
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
              <span className="text-sm font-medium">
                {formatPrice(product.retailPrice)}
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
  );
}
