"use server";

import { createLogger } from "@/lib/logger";
import { ProductServiceApi } from "@/services/api/product/product-service-api";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { FileAsset } from "@/types/api-assets";
import { isApiError } from "@/types/api-assets";
import { uploadFileAction } from "./action-test-assets";

const logger = createLogger("action-product-images");

/**
 * Helper function to update product PATH_IMAGEM when a new primary image is set
 *
 * This function checks if the uploaded image became the primary image in the gallery
 * and updates PATH_IMAGEM accordingly. It handles the following scenarios:
 *
 * 1. First image uploaded → automatically becomes primary → update PATH_IMAGEM
 * 2. Additional image uploaded → NOT primary → don't update PATH_IMAGEM
 * 3. Image replaces deleted primary → becomes primary → update PATH_IMAGEM
 *
 * @param productId - Product ID to update
 * @param uploadedImageId - The ID of the newly uploaded image
 * @param imageUrl - New image URL to set as PATH_IMAGEM
 */
async function updateProductImagePathIfPrimary(
  productId: number,
  uploadedImageId: string,
  imageUrl: string,
): Promise<void> {
  try {
    // Fetch the gallery to check if the uploaded image is now the primary
    const galleryResponse = await assetsApiService.getEntityGallery({
      entityType: "PRODUCT",
      entityId: productId.toString(),
    });

    if (isApiError(galleryResponse)) {
      logger.warn(
        `Could not fetch gallery for product ${productId} to check primary image:`,
        galleryResponse.message,
      );
      return;
    }

    // Find the uploaded image in the gallery
    const uploadedImage = galleryResponse.images?.find(
      (img) => img.id === uploadedImageId,
    );

    // Only update PATH_IMAGEM if the uploaded image is now the primary image
    if (!uploadedImage?.isPrimary) {
      logger.debug(
        `Uploaded image ${uploadedImageId} is not primary for product ${productId}. Skipping PATH_IMAGEM update.`,
      );
      return;
    }

    // The uploaded image is the primary image, update PATH_IMAGEM
    logger.debug(
      `Uploaded image ${uploadedImageId} is primary for product ${productId}. Updating PATH_IMAGEM.`,
    );

    const updateResponse = await ProductServiceApi.updateProductImagePath({
      pe_id_produto: productId,
      pe_path_imagem: imageUrl,
    });

    // Check if update was successful
    if (ProductServiceApi.isOperationSuccessful(updateResponse)) {
      logger.debug(`Successfully updated PATH_IMAGEM for product ${productId}`);
    } else {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(updateResponse);
      logger.warn(
        `Failed to update PATH_IMAGEM for product ${productId}:`,
        spResponse?.sp_message || updateResponse.message,
      );
    }
  } catch (error) {
    logger.error(`Error updating PATH_IMAGEM for product ${productId}:`, error);
    throw error;
  }
}

/**
 * Server Actions for Product Image Upload
 * These actions handle file uploads for products using the external Assets API
 */

interface UploadProductImageResponse {
  success: boolean;
  data?: FileAsset;
  error?: string;
}

interface DeleteProductImageResponse {
  success: boolean;
  error?: string;
}

interface SetPrimaryImageResponse {
  success: boolean;
  error?: string;
}

/**
 * Upload image for a product
 * Used by ProductImageGallery component to upload new product images
 *
 * @param formData FormData containing:
 *   - file: File object to upload
 *   - productId: Product ID (will be used as entityId)
 *   - tags: Optional comma-separated tags
 *   - description: Optional image description
 *   - altText: Optional alt text for accessibility
 */
export async function uploadProductImageAction(
  formData: FormData,
): Promise<UploadProductImageResponse> {
  try {
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;
    const tagsString = formData.get("tags") as string;
    const description = formData.get("description") as string;
    const altText = formData.get("altText") as string;

    // Validate required fields
    if (!file || !productId) {
      return {
        success: false,
        error: "Arquivo e ID do produto são obrigatórios",
      };
    }

    // Validate file is actually a file
    if (!(file instanceof File)) {
      return {
        success: false,
        error: "Arquivo inválido",
      };
    }

    // Debug info removed for cleaner console output

    // Create FormData exactly like test page does
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("entityType", "PRODUCT");
    uploadFormData.append("entityId", productId);
    if (tagsString) uploadFormData.append("tags", tagsString);
    if (description) uploadFormData.append("description", description);
    if (altText) uploadFormData.append("altText", altText);

    // FormData logging removed for cleaner console output

    // Call the test assets action that we know works
    const result = await uploadFileAction(uploadFormData);

    // If upload was successful, check if this image became the primary and update PATH_IMAGEM
    if (result.success && result.data?.id && result.data?.urls?.preview) {
      try {
        await updateProductImagePathIfPrimary(
          Number(productId),
          result.data.id,
          result.data.urls.preview,
        );
      } catch (pathUpdateError) {
        // Log error but don't fail the upload - image was successfully uploaded
        logger.warn(
          `Failed to update PATH_IMAGEM for product ${productId}:`,
          pathUpdateError,
        );
        // Upload was successful, just PATH_IMAGEM update failed
        // This is not critical enough to fail the entire operation
      }
    }

    // Return the result from the working uploadFileAction
    return result;
  } catch (error) {
    console.error("Upload product image action error:", error);
    return {
      success: false,
      error: "Erro interno ao fazer upload da imagem",
    };
  }
}

/**
 * Delete image from a product gallery
 * Used by ProductImageGallery component to delete product images
 *
 * This action:
 * 1. Deletes the image from the Assets API
 * 2. If the deleted image was primary, gets the new primary image from gallery
 * 3. Updates PATH_IMAGEM with the new primary image URL (or clears it if no images left)
 *
 * @param imageId UUID of the image to delete
 * @param productId Product ID (required to update PATH_IMAGEM if primary image is deleted)
 * @param wasPrimary Whether the deleted image was the primary image
 */
export async function deleteProductImageAction(
  imageId: string,
  productId?: string,
  wasPrimary?: boolean,
): Promise<DeleteProductImageResponse> {
  try {
    // Validate required fields
    if (!imageId || typeof imageId !== "string") {
      return {
        success: false,
        error: "ID da imagem é obrigatório",
      };
    }

    // Call the assets API to delete the file
    const result = await assetsApiService.deleteFile({ id: imageId });

    // Check if response is an error
    if (isApiError(result)) {
      logger.warn(`Failed to delete image ${imageId}: ${result.message}`);
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Erro ao excluir imagem",
      };
    }

    // If the deleted image was primary and we have productId, update PATH_IMAGEM
    if (wasPrimary && productId) {
      try {
        // Fetch the updated gallery to get the new primary image
        const galleryResponse = await assetsApiService.getEntityGallery({
          entityType: "PRODUCT",
          entityId: productId,
        });

        if (!isApiError(galleryResponse)) {
          // Find the new primary image (the one with isPrimary = true)
          const newPrimaryImage = galleryResponse.images?.find(
            (img) => img.isPrimary,
          );

          if (newPrimaryImage?.urls?.preview) {
            // Update PATH_IMAGEM with the new primary image URL
            logger.debug(
              `Updating PATH_IMAGEM for product ${productId} with new primary image: ${newPrimaryImage.urls.preview}`,
            );
            const updateResponse =
              await ProductServiceApi.updateProductImagePath({
                pe_id_produto: Number(productId),
                pe_path_imagem: newPrimaryImage.urls.preview,
              });

            if (!ProductServiceApi.isOperationSuccessful(updateResponse)) {
              const spResponse =
                ProductServiceApi.extractStoredProcedureResponse(
                  updateResponse,
                );
              logger.warn(
                `Failed to update PATH_IMAGEM for product ${productId}:`,
                spResponse?.sp_message || updateResponse.message,
              );
            }
          } else if (
            !galleryResponse.images ||
            galleryResponse.images.length === 0
          ) {
            // No images left, clear PATH_IMAGEM
            logger.debug(
              `No images left for product ${productId}. Clearing PATH_IMAGEM.`,
            );
            const updateResponse =
              await ProductServiceApi.updateProductImagePath({
                pe_id_produto: Number(productId),
                pe_path_imagem: "",
              });

            if (!ProductServiceApi.isOperationSuccessful(updateResponse)) {
              const spResponse =
                ProductServiceApi.extractStoredProcedureResponse(
                  updateResponse,
                );
              logger.warn(
                `Failed to clear PATH_IMAGEM for product ${productId}:`,
                spResponse?.sp_message || updateResponse.message,
              );
            }
          } else {
            // Images exist but none is primary - this shouldn't happen normally
            // The Assets API should auto-promote the next image, but let's handle it
            const firstImage = galleryResponse.images[0];
            if (firstImage?.urls?.preview) {
              logger.warn(
                `No primary image found for product ${productId} after deletion. Using first image as fallback.`,
              );
              const updateResponse =
                await ProductServiceApi.updateProductImagePath({
                  pe_id_produto: Number(productId),
                  pe_path_imagem: firstImage.urls.preview,
                });

              if (!ProductServiceApi.isOperationSuccessful(updateResponse)) {
                const spResponse =
                  ProductServiceApi.extractStoredProcedureResponse(
                    updateResponse,
                  );
                logger.warn(
                  `Failed to update PATH_IMAGEM for product ${productId}:`,
                  spResponse?.sp_message || updateResponse.message,
                );
              }
            }
          }
        }
      } catch (pathUpdateError) {
        // Log error but don't fail - the image was deleted successfully
        logger.warn(
          `Failed to update PATH_IMAGEM after deleting primary image for product ${productId}:`,
          pathUpdateError,
        );
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Delete product image action error:", error);
    return {
      success: false,
      error: "Erro interno ao excluir imagem",
    };
  }
}

/**
 * Set image as primary for a product
 * Used by ProductImageGallery component to promote images to primary
 *
 * This action:
 * 1. Sets the image as primary in the Assets API
 * 2. Updates the product's PATH_IMAGEM field with the new primary image URL
 *
 * @param productId Product ID
 * @param imageId UUID of the image to set as primary
 */
export async function setPrimaryImageAction(
  productId: string,
  imageId: string,
): Promise<SetPrimaryImageResponse> {
  try {
    // Validate required fields
    if (!productId || !imageId) {
      return {
        success: false,
        error: "ID do produto e da imagem são obrigatórios",
      };
    }

    // Call the assets API to set primary image
    const result = await assetsApiService.setPrimaryImage({
      entityType: "PRODUCT",
      entityId: productId,
      assetId: imageId,
      displayOrder: 1,
    });

    // Check if response is an error
    if (isApiError(result)) {
      logger.warn(`Failed to set primary image ${imageId}: ${result.message}`);
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Erro ao definir imagem principal",
      };
    }

    // Get the image details to retrieve its URL for PATH_IMAGEM update
    const imageDetails = await assetsApiService.findFile({ id: imageId });

    if (!isApiError(imageDetails) && imageDetails.urls?.preview) {
      // Update PATH_IMAGEM with the new primary image URL
      try {
        const updateResponse = await ProductServiceApi.updateProductImagePath({
          pe_id_produto: Number(productId),
          pe_path_imagem: imageDetails.urls.preview,
        });

        if (!ProductServiceApi.isOperationSuccessful(updateResponse)) {
          const spResponse =
            ProductServiceApi.extractStoredProcedureResponse(updateResponse);
          logger.warn(
            `Failed to update PATH_IMAGEM for product ${productId}:`,
            spResponse?.sp_message || updateResponse.message,
          );
          // Don't fail the operation - primary image was set successfully
        }
      } catch (pathUpdateError) {
        // Log error but don't fail - the primary image was set successfully in Assets API
        logger.warn(
          `Failed to update PATH_IMAGEM for product ${productId}:`,
          pathUpdateError,
        );
      }
    } else {
      logger.warn(
        `Could not retrieve image details for ${imageId} to update PATH_IMAGEM`,
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Set primary image action error:", error);
    return {
      success: false,
      error: "Erro interno ao definir imagem principal",
    };
  }
}
