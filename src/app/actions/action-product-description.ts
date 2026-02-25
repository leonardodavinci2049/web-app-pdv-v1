"use server";

import { createLogger } from "@/lib/logger";
import { ProductServiceApi } from "@/services/api/product/product-service-api";

const logger = createLogger("ProductDescriptionActions");

/**
 * Update product description (ANOTACOES field)
 * Uses ENDPOINT 17 - Update product full description
 * @param productId - Product ID
 * @param description - New description text
 * @returns Success status and message
 */
export async function updateProductDescription(
  productId: number,
  description: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        message: "ID do produto inválido",
      };
    }

    logger.info("Iniciando atualização de descrição", {
      productId,
      descriptionLength: description.length,
    });

    // Call API service to update description
    const response = await ProductServiceApi.updateProductDescription({
      pe_id_produto: productId,
      pe_produto_descricao: description,
    });

    logger.info("Resposta da API recebida", {
      statusCode: response.statusCode,
    });

    // Check if operation was successful
    if (ProductServiceApi.isOperationSuccessful(response)) {
      logger.info(`Descrição do produto ${productId} atualizada com sucesso`);
      return {
        success: true,
        message: "Descrição atualizada com sucesso",
      };
    }

    // Operation failed
    const errorMessage =
      response.message || "Erro ao atualizar descrição do produto";
    logger.error(`Erro ao atualizar descrição do produto ${productId}`, {
      response,
    });

    return {
      success: false,
      message: errorMessage,
    };
  } catch (error) {
    logger.error("Erro ao atualizar descrição do produto", error);

    // Handle specific error messages
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao atualizar descrição",
    };
  }
}
