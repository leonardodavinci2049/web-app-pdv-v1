"use client";

import {
  Box,
  Layers,
  Package,
  Ruler,
  ShieldCheck,
  Tag,
  Weight,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

interface ProductDetailDialogProps {
  product: UIProductPdv;
}

export function ProductDetailDialog({ product }: ProductDetailDialogProps) {
  const validImage =
    product.imagePath &&
    (product.imagePath.startsWith("/") || product.imagePath.startsWith("http"))
      ? product.imagePath
      : undefined;
  const [imgSrc, setImgSrc] = useState(validImage);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/30 transition-colors hover:bg-muted/50 sm:h-16 sm:w-16"
        >
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.name}
              width={64}
              height={64}
              className="h-full w-full object-contain p-1"
              onError={() => setImgSrc(undefined)}
            />
          ) : (
            <Package className="h-5 w-5 text-muted-foreground/40" />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
        <div className="flex flex-col items-center gap-3 overflow-hidden bg-muted/30 px-6 pt-6 pb-4">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.name}
              width={160}
              height={160}
              className="h-40 w-40 rounded-xl border border-border/40 object-contain p-2 shadow-sm"
              onError={() => setImgSrc(undefined)}
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-border/40 bg-muted/20 shadow-sm">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <DialogHeader className="w-full items-center space-y-0.5 overflow-hidden">
            <DialogTitle className="max-w-full text-center text-base leading-snug">
              {product.name}
            </DialogTitle>
            {product.model && (
              <p className="text-xs text-muted-foreground">
                Modelo: {product.model}
              </p>
            )}
          </DialogHeader>
        </div>

        <div className="grid gap-1 px-4 py-4">
          {product.ref && (
            <DetailRow icon={Tag} label="Referência" value={product.ref} />
          )}
          {product.sku && (
            <DetailRow icon={Tag} label="SKU" value={String(product.sku)} />
          )}
          {product.brand && (
            <DetailRow icon={ShieldCheck} label="Marca" value={product.brand} />
          )}
          {product.ean && (
            <DetailRow icon={Tag} label="EAN" value={product.ean} />
          )}
          <DetailRow
            icon={Layers}
            label="Estoque"
            value={
              product.storeStock > 0
                ? `${product.storeStock} un.`
                : "Sem estoque"
            }
          />
          {product.wholesalePrice && Number(product.wholesalePrice) > 0 && (
            <DetailRow
              icon={Box}
              label="Atacado"
              value={formatCurrency(Number(product.wholesalePrice))}
            />
          )}
          {product.retailPrice && Number(product.retailPrice) > 0 && (
            <DetailRow
              icon={Box}
              label="Varejo"
              value={formatCurrency(Number(product.retailPrice))}
            />
          )}
          {product.corporatePrice && Number(product.corporatePrice) > 0 && (
            <DetailRow
              icon={Box}
              label="Corporativo"
              value={formatCurrency(Number(product.corporatePrice))}
            />
          )}
          {product.weightGr && product.weightGr > 0 && (
            <DetailRow
              icon={Weight}
              label="Peso"
              value={`${product.weightGr}g`}
            />
          )}
          {product.lengthMm &&
            product.widthMm &&
            product.heightMm &&
            (product.lengthMm > 0 ||
              product.widthMm > 0 ||
              product.heightMm > 0) && (
              <DetailRow
                icon={Ruler}
                label="Dimensões"
                value={`${product.lengthMm}×${product.widthMm}×${product.heightMm} mm`}
              />
            )}
          {product.warrantyMonths && product.warrantyMonths > 0 && (
            <DetailRow
              icon={ShieldCheck}
              label="Garantia"
              value={`${product.warrantyMonths} meses`}
            />
          )}
          {product.shortDescription && (
            <div className="mt-2 rounded-lg bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {product.shortDescription}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/40">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
