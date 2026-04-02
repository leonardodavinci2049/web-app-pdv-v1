"use client";

import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  createImageErrorHandler,
  DEFAULT_PRODUCT_IMAGE,
  getValidImageUrl,
} from "@/utils/image-utils";

interface GalleryImage {
  id: string;
  url: string;
  originalUrl: string;
  mediumUrl: string;
  previewUrl: string;
  isPrimary: boolean;
}

interface ProductViewGalleryClientProps {
  initialImages: GalleryImage[];
  fallbackImage: string;
}

export function ProductViewGalleryClient({
  initialImages,
  fallbackImage,
}: ProductViewGalleryClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const imageErrorHandlers = createImageErrorHandler(DEFAULT_PRODUCT_IMAGE);
  const resolvedFallbackImage = getValidImageUrl(fallbackImage);

  const images =
    initialImages.length > 0
      ? initialImages
      : [
          {
            id: "fallback",
            url: resolvedFallbackImage,
            originalUrl: resolvedFallbackImage,
            mediumUrl: resolvedFallbackImage,
            previewUrl: resolvedFallbackImage,
            isPrimary: true,
          },
        ];
  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border group">
        <Image
          src={getValidImageUrl(currentImage?.url)}
          alt="Product image"
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={imageErrorHandlers.onError}
        />

        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setModalOpen(true)}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {images.map((img, idx) => (
            <button
              type="button"
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={getValidImageUrl(img.url)}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="100px"
                onError={imageErrorHandlers.onError}
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[90vw] h-[90vh] p-0 flex flex-col bg-black/95 border-none">
          <DialogTitle className="sr-only">Visualização de Imagem</DialogTitle>
          <div className="relative flex-1 w-full h-full flex items-center justify-center">
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full text-white hover:bg-white/20 z-10"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            <div className="relative w-full h-full p-4">
              <Image
                src={getValidImageUrl(
                  currentImage?.originalUrl || currentImage?.url,
                )}
                alt="Product image zoom"
                fill
                className="object-contain"
                sizes="100vw"
                quality={100}
                onError={imageErrorHandlers.onError}
              />
            </div>

            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full text-white hover:bg-white/20 z-10"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center text-white/70 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
