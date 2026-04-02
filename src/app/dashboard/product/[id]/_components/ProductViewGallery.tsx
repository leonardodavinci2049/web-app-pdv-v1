import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/types/api-assets";
import { getValidImageUrl } from "@/utils/image-utils";
import { ProductViewGalleryClient } from "./ProductViewGalleryClient";

const logger = createLogger("ProductViewGallery");

interface ProductViewGalleryProps {
  productId: number;
  fallbackImage: string;
}

export async function ProductViewGallery({
  productId,
  fallbackImage,
}: ProductViewGalleryProps) {
  const resolvedFallbackImage = getValidImageUrl(fallbackImage);

  const fallbackGalleryImage = {
    id: "fallback",
    url: resolvedFallbackImage,
    originalUrl: resolvedFallbackImage,
    mediumUrl: resolvedFallbackImage,
    previewUrl: resolvedFallbackImage,
    isPrimary: true,
  };

  try {
    const galleryResponse = await assetsApiService.getEntityGallery({
      entityType: "PRODUCT",
      entityId: productId.toString(),
    });

    if (isApiError(galleryResponse)) {
      logger.warn(
        `Failed to fetch gallery for product ${productId}: ${galleryResponse.message}`,
      );
      return (
        <ProductViewGalleryClient
          initialImages={[fallbackGalleryImage]}
          fallbackImage={resolvedFallbackImage}
        />
      );
    }

    const sortedImages = [...galleryResponse.images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      if (a.displayOrder !== b.displayOrder)
        return a.displayOrder - b.displayOrder;
      return (
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    });

    const galleryImages = sortedImages
      .map((img) => ({
        id: img.id,
        url: img.urls.preview ?? img.urls.medium ?? img.urls.original,
        originalUrl: img.urls.original ?? img.urls.preview,
        mediumUrl: img.urls.medium ?? img.urls.preview ?? img.urls.original,
        previewUrl: img.urls.preview ?? img.urls.medium ?? img.urls.original,
        isPrimary: img.isPrimary,
      }))
      .filter((img) => img.url !== undefined);

    if (galleryImages.length === 0) {
      return (
        <ProductViewGalleryClient
          initialImages={[fallbackGalleryImage]}
          fallbackImage={resolvedFallbackImage}
        />
      );
    }

    return (
      <ProductViewGalleryClient
        initialImages={galleryImages}
        fallbackImage={resolvedFallbackImage}
      />
    );
  } catch (error) {
    logger.error(
      `Unexpected error fetching gallery for product ${productId}:`,
      error,
    );
    return (
      <ProductViewGalleryClient
        initialImages={[fallbackGalleryImage]}
        fallbackImage={resolvedFallbackImage}
      />
    );
  }
}
