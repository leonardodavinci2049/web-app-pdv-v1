import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";

const logger = createLogger("GalleryCachedService");

/**
 * Check if error is a connection error (expected during build when API is unavailable)
 */
function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("connection") ||
      message.includes("econnrefused") ||
      message.includes("fetch failed") ||
      message.includes("network")
    );
  }
  return false;
}

/**
 * Fetch product image gallery from Assets API with cache
 * Uses 'use cache' for automatic caching and deduplication
 * Returns array of gallery images or empty array on error
 */
export async function getProductGallery(
  productId: string,
): Promise<GalleryImage[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.productGallery(productId));

  try {
    const response = await assetsApiService.getEntityGallery({
      entityType: "PRODUCT",
      entityId: productId,
    });

    // Check if response has images (successful response)
    if ("images" in response && Array.isArray(response.images)) {
      return response.images;
    }

    // Error response or no images
    return [];
  } catch (error) {
    if (!isConnectionError(error)) {
      logger.error("Failed to fetch product gallery:", error);
    }
    return [];
  }
}
