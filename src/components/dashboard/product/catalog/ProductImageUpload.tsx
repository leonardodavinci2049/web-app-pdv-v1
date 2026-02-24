"use client";

import { Loader2, Package, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { uploadProductImageAction } from "@/app/actions/action-product-images";
import { useTranslation } from "@/hooks/use-translation";

interface ProductImageUploadProps {
  productId: string;
  productName: string;
  viewMode: "grid" | "list";
  onUploadSuccess?: () => void | Promise<void>;
}

export function ProductImageUpload({
  productId,
  productName,
  viewMode,
  onUploadSuccess,
}: ProductImageUploadProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle image upload
  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // Take only first file for inline upload
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("dashboard.products.catalog.upload.invalidFileType"));
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("dashboard.products.catalog.upload.fileTooLarge"));
        return;
      }

      setIsUploading(true);

      try {
        // Create FormData for upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", productId);
        formData.append("description", `${productName} - Imagem principal`);
        formData.append("altText", `Imagem do produto ${productName}`);

        // Call server action to upload
        const result = await uploadProductImageAction(formData);

        if (result.success) {
          toast.success(t("dashboard.products.catalog.upload.success"));

          // Trigger refresh callback
          if (onUploadSuccess) {
            await onUploadSuccess();
          }
        } else {
          toast.error(
            result.error || t("dashboard.products.catalog.upload.error"),
          );
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(t("dashboard.products.catalog.upload.error"));
      } finally {
        setIsUploading(false);
      }
    },
    [productId, productName, onUploadSuccess, t],
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      handleImageUpload(files);
    },
    [handleImageUpload],
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      handleImageUpload(files);

      // Reset input value so the same file can be selected again
      e.target.value = "";
    },
    [handleImageUpload],
  );

  // Grid mode styles
  if (viewMode === "grid") {
    return (
      <button
        type="button"
        className={`
          relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all duration-200
          border-2 border-dashed border-muted-foreground/30 hover:border-primary/50
          bg-muted/50 hover:bg-muted/80 w-full
          ${isDragOver ? "border-primary bg-primary/10" : ""}
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isUploading}
        onClick={() =>
          document.getElementById(`file-input-${productId}`)?.click()
        }
      >
        <input
          id={`file-input-${productId}`}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          disabled={isUploading}
          aria-label={t("dashboard.products.catalog.upload.ariaLabel")}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {t("dashboard.product.gallery.uploading")}
              </span>
            </>
          ) : isDragOver ? (
            <>
              <Package className="h-8 w-8 text-primary" />
              <span className="text-xs font-medium text-primary">
                {t("dashboard.product.gallery.dropHere")}
              </span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium text-muted-foreground">
                {t("dashboard.products.catalog.upload.addImage")}
              </span>
              <span className="text-xs text-muted-foreground/70">
                {t("dashboard.products.catalog.upload.clickOrDrag")}
              </span>
            </>
          )}
        </div>
      </button>
    );
  }

  // List mode styles
  return (
    <button
      type="button"
      className={`
        relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all duration-200
        border-2 border-dashed border-muted-foreground/30 hover:border-primary/50
        bg-muted/50 hover:bg-muted/80
        ${isDragOver ? "border-primary bg-primary/10" : ""}
        ${isUploading ? "pointer-events-none opacity-60" : ""}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      disabled={isUploading}
      onClick={() =>
        document.getElementById(`file-input-list-${productId}`)?.click()
      }
    >
      <input
        id={`file-input-list-${productId}`}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        disabled={isUploading}
        aria-label={t("dashboard.products.catalog.upload.ariaLabel")}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              {t("dashboard.product.gallery.uploading")}
            </span>
          </>
        ) : isDragOver ? (
          <>
            <Package className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-primary">
              {t("dashboard.product.gallery.dropHere")}
            </span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            <span className="text-xs font-medium text-muted-foreground text-center leading-tight">
              {t("dashboard.products.catalog.upload.addImage")}
            </span>
          </>
        )}
      </div>
    </button>
  );
}
