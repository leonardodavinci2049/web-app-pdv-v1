"use client";

import { Plane, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import {
  DEFAULT_PRODUCT_IMAGE,
  getValidImageUrl,
} from "../../../../../utils/image-utils";
import { ProductImageUpload } from "./ProductImageUpload";

interface ProductCardClientProps {
  product: UIProductPdv;
  viewMode: "grid" | "list";
  onImageUploadSuccess?: () => void;
  hasPromotion?: boolean;
}

interface ProductImageSectionProps {
  product: UIProductPdv;
  viewMode: "grid" | "list";
  onImageUploadSuccess?: () => void;
  hasPromotion?: boolean;
}

function ProductImageSection({
  product,
  viewMode,
  onImageUploadSuccess,
  hasPromotion = false,
}: ProductImageSectionProps) {
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = product.storeStock === 0;

  const imageUrl = getValidImageUrl(product.imagePath);

  const hasImagePath =
    product.imagePath &&
    product.imagePath.trim() !== "" &&
    product.imagePath !== "/images/product/no-image.jpeg";

  // No image set at all - show upload UI
  if (!hasImagePath) {
    return (
      <ProductImageUpload
        productId={String(product.id)}
        productName={product.name}
        viewMode={viewMode}
        onUploadSuccess={onImageUploadSuccess}
      />
    );
  }

  // Use fallback when image failed to load
  const displayUrl = imageError ? DEFAULT_PRODUCT_IMAGE : imageUrl;

  if (viewMode === "list") {
    const imageContent = (
      <div className="relative h-24 w-24 flex-shrink-0">
        <Image
          src={displayUrl}
          alt={`Imagem do produto ${product.name}`}
          fill
          className="rounded-md object-cover"
          sizes="(max-width: 96px) 100vw, 96px"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
            <Badge variant="destructive" className="text-xs">
              Esgotado
            </Badge>
          </div>
        )}
      </div>
    );

    return (
      <Link href={`/dashboard/product/${product.id}`}>{imageContent}</Link>
    );
  }

  const gridImageContent = (
    <div className="relative aspect-square overflow-hidden rounded-md">
      <Image
        src={displayUrl}
        alt={`Imagem do produto ${product.name}`}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        loading="lazy"
        onError={() => setImageError(true)}
      />

      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {hasPromotion && (
          <Badge className="bg-red-500 text-xs hover:bg-red-600">
            Promoção
          </Badge>
        )}
        {product.launch && (
          <Badge className="bg-blue-500 text-xs hover:bg-blue-600">
            <Star className="h-3 w-3 mr-1" />
            Novo
          </Badge>
        )}
        {product.imported && (
          <Badge variant="secondary" className="text-xs">
            <Plane className="h-3 w-3 mr-1" />
            Importado
          </Badge>
        )}
      </div>

      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Badge variant="destructive">Esgotado</Badge>
        </div>
      )}
    </div>
  );

  return (
    <Link href={`/dashboard/product/${product.id}`}>{gridImageContent}</Link>
  );
}

export function ProductCardClient({
  product,
  viewMode,
  onImageUploadSuccess,
  hasPromotion,
}: ProductCardClientProps) {
  return (
    <ProductImageSection
      product={product}
      viewMode={viewMode}
      onImageUploadSuccess={onImageUploadSuccess}
      hasPromotion={hasPromotion}
    />
  );
}
