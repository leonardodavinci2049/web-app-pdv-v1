"use client";

import { useState } from "react";
import {
  type GalleryImageWithId,
  ProductImageGallery,
} from "./ProductImageGallery";

interface ProductImageGalleryRefreshProps {
  productId: number;
  productName: string;
  fallbackImage: string;
  initialImages: GalleryImageWithId[];
}

/**
 * ProductImageGalleryRefresh - Client Component wrapper for ProductImageGallery
 *
 * This component wraps ProductImageGallery and adds the ability to refresh
 * the gallery after a successful image upload by refetching from the API.
 *
 * It handles:
 * - Managing gallery state locally
 * - Refreshing the gallery after upload success
 * - Calling the API to get updated images
 */
export function ProductImageGalleryRefresh({
  productId,
  productName,
  fallbackImage,
  initialImages,
}: ProductImageGalleryRefreshProps) {
  const [images, setImages] = useState<GalleryImageWithId[]>(initialImages);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleImageUploadSuccess = async () => {
    setIsRefreshing(true);

    try {
      // Fetch updated gallery from the API
      const response = await fetch("/api/product-gallery/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh gallery");
      }

      const data = await response.json();

      if (data.success && data.images) {
        // Update images with the new gallery
        setImages(
          data.images.length > 0
            ? data.images
            : [
                {
                  id: "fallback",
                  url: fallbackImage,
                  originalUrl: fallbackImage,
                  mediumUrl: fallbackImage,
                  previewUrl: fallbackImage,
                  isPrimary: true,
                },
              ],
        );
      } else {
        // Keep existing images if refresh fails
        console.error("Gallery refresh failed:", data.error);
      }
    } catch (error) {
      // Keep existing images on error
      console.error("Error refreshing gallery:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ProductImageGallery
      images={images}
      productName={productName}
      productId={productId}
      fallbackImage={fallbackImage}
      onImageUploadSuccess={isRefreshing ? undefined : handleImageUploadSuccess}
    />
  );
}
