import { createLogger } from "@/lib/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/types/api-assets";

import { ProductImageGalleryRefresh } from "./ProductImageGalleryRefresh";

const logger = createLogger("ProductImageGalleryServer");

interface ProductImageGalleryServerProps {
  productId: number;
  productName: string;
  fallbackImage: string;
}

/**
 * ProductImageGalleryServer - Server Component that fetches gallery images from API
 *
 * This component:
 * 1. Fetches images from the external assets API using the entity-gallery endpoint
 * 2. Sorts images by isPrimary (primary first), then displayOrder, then upload date
 * 3. Transforms the response to extract image URLs in correct order
 * 4. Applies fallback image if gallery is empty or error occurs
 * 5. Wraps the client-side ProductImageGallery with refresh functionality
 */
export async function ProductImageGalleryServer({
  productId,
  productName,
  fallbackImage,
}: ProductImageGalleryServerProps) {
  try {
    // Fetch gallery from API
    const galleryResponse = await assetsApiService.getEntityGallery({
      entityType: "PRODUCT",
      entityId: productId.toString(),
    });

    // Check if response is an error
    if (isApiError(galleryResponse)) {
      logger.warn(
        `Failed to fetch gallery for product ${productId}: ${galleryResponse.message}`,
      );

      // Use fallback image (from PATH_IMAGEM) on error with refresh wrapper
      return (
        <ProductImageGalleryRefresh
          productId={productId}
          productName={productName}
          fallbackImage={fallbackImage}
          initialImages={[
            {
              id: "fallback",
              url: fallbackImage,
              originalUrl: fallbackImage,
              mediumUrl: fallbackImage,
              previewUrl: fallbackImage,
              isPrimary: true,
            },
          ]}
        />
      );
    }

    // Sort images: primary first, then by displayOrder, then by upload date
    const sortedImages = [...galleryResponse.images].sort((a, b) => {
      // Primary images first
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;

      // Then by display order
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }

      // Finally by upload date (newest first)
      return (
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    });

    // Transform to gallery image structure with IDs
    // Prefer 'preview' resolution (800x600) for better desktop quality,
    // fallback to 'medium' (400x400) and then 'original' if needed
    const galleryImages = sortedImages
      .map((img) => ({
        id: img.id,
        url: img.urls.preview ?? img.urls.medium ?? img.urls.original,
        originalUrl: img.urls.original ?? img.urls.preview,
        mediumUrl: img.urls.medium ?? img.urls.preview ?? img.urls.original,
        previewUrl: img.urls.preview ?? img.urls.medium ?? img.urls.original,
        isPrimary: img.isPrimary,
      }))
      .filter(
        (
          img,
        ): img is {
          id: string;
          url: string;
          originalUrl: string;
          mediumUrl: string;
          previewUrl: string;
          isPrimary: boolean;
        } => img.url !== undefined,
      );

    // Apply fallback if gallery is empty
    if (galleryImages.length === 0) {
      // Use fallback image from PATH_IMAGEM when gallery is empty
      return (
        <ProductImageGalleryRefresh
          productId={productId}
          productName={productName}
          fallbackImage={fallbackImage}
          initialImages={[
            {
              id: "fallback",
              url: fallbackImage,
              originalUrl: fallbackImage,
              mediumUrl: fallbackImage,
              previewUrl: fallbackImage,
              isPrimary: true,
            },
          ]}
        />
      );
    }

    return (
      <ProductImageGalleryRefresh
        productId={productId}
        productName={productName}
        fallbackImage={fallbackImage}
        initialImages={galleryImages}
      />
    );
  } catch (error) {
    logger.error(
      `Unexpected error fetching gallery for product ${productId}:`,
      error,
    );

    // Use fallback image on unexpected error with refresh wrapper
    return (
      <ProductImageGalleryRefresh
        productId={productId}
        productName={productName}
        fallbackImage={fallbackImage}
        initialImages={[
          {
            id: "fallback",
            url: fallbackImage,
            originalUrl: fallbackImage,
            mediumUrl: fallbackImage,
            previewUrl: fallbackImage,
            isPrimary: true,
          },
        ]}
      />
    );
  }
}
