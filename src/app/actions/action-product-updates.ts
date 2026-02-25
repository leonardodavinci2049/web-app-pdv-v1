"use server";

import { createLogger } from "@/lib/logger";
import { ProductServiceApi } from "@/services/api/product/product-service-api";

const logger = createLogger("ProductUpdateActions");

/**
 * Server Action: Update product name
 * @param productId - Product ID to update
 * @param name - New product name
 * @returns Success status and error message if any
 */
export async function updateProductName(
  productId: number,
  name: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!name || !name.trim()) {
      return {
        success: false,
        error: "Nome do produto não pode ser vazio",
      };
    }

    // Call API service
    const response = await ProductServiceApi.updateProductName({
      pe_id_produto: productId,
      pe_nome_produto: name.trim(),
    });

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar nome do produto";

      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    logger.info("Product name updated successfully:", { productId, name });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product name:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar nome do produto";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product short description
 * @param productId - Product ID to update
 * @param shortDescription - New short description
 * @returns Success status and error message if any
 */
export async function updateProductShortDescription(
  productId: number,
  shortDescription: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!shortDescription || !shortDescription.trim()) {
      return {
        success: false,
        error: "Descrição curta não pode ser vazia",
      };
    }

    // Call API service
    const response = await ProductServiceApi.updateProductShortDescription({
      pe_id_produto: productId,
      pe_descricao_venda: shortDescription.trim(),
    });

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar descrição curta";

      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    logger.info("Product short description updated successfully:", {
      productId,
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product short description:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar descrição curta";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product full description
 * @param productId - Product ID to update
 * @param description - New full description
 * @returns Success status and error message if any
 */
export async function updateProductDescription(
  productId: number,
  description: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!description || !description.trim()) {
      return {
        success: false,
        error: "Descrição não pode ser vazia",
      };
    }

    // Call API service
    const response = await ProductServiceApi.updateProductDescription({
      pe_id_produto: productId,
      pe_produto_descricao: description.trim(),
    });

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar descrição completa";

      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    logger.info("Product description updated successfully:", { productId });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product description:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar descrição completa";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product image path
 * @param productId - Product ID to update
 * @param imagePath - New image path
 * @returns Success status and error message if any
 */
export async function updateProductImagePath(
  productId: number,
  imagePath: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!imagePath || !imagePath.trim()) {
      return {
        success: false,
        error: "Caminho da imagem não pode ser vazio",
      };
    }

    // Call API service
    const response = await ProductServiceApi.updateProductImagePath({
      pe_id_produto: productId,
      pe_path_imagem: imagePath.trim(),
    });

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar caminho da imagem";

      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    logger.info("Product image path updated successfully:", { productId });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product image path:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar caminho da imagem";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product stock
 * @param productId - Product ID to update
 * @param stock - New stock quantity
 * @param minStock - Minimum stock quantity
 * @returns Success status and error message if any
 */
export async function updateProductStock(
  productId: number,
  stock: number,
  minStock: number = 0,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (stock < 0 || minStock < 0) {
      return {
        success: false,
        error: "Estoque não pode ser negativo",
      };
    }

    // Call API service
    const response = await ProductServiceApi.updateProductStock({
      pe_id_produto: productId,
      pe_qt_estoque: stock,
      pe_qt_minimo: minStock,
    });

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar estoque";

      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    logger.info("Product stock updated successfully:", { productId, stock });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product stock:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar estoque";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product prices
 * @param productId - Product ID to update
 * @param wholesalePrice - Wholesale price
 * @param corporatePrice - Corporate price
 * @param retailPrice - Retail price
 * @returns Success status and error message if any
 */
export async function updateProductPrice(
  productId: number,
  wholesalePrice: number,
  corporatePrice: number,
  retailPrice: number,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (wholesalePrice < 0 || corporatePrice < 0 || retailPrice < 0) {
      return {
        success: false,
        error: "Preços não podem ser negativos",
      };
    }

    // Call API service
    const response = await ProductServiceApi.updateProductPrice({
      pe_id_produto: productId,
      pe_preco_venda_atac: wholesalePrice,
      pe_preco_venda_corporativo: corporatePrice,
      pe_preco_venda_vare: retailPrice,
    });

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage = spResponse?.sp_message || "Erro ao atualizar preços";

      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    logger.info("Product prices updated successfully:", { productId });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product prices:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar preços";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product type
 * @param productId - Product ID to update
 * @param typeId - New type ID
 * @returns Success status and error message if any
 */
export async function updateProductType(
  productId: number,
  typeId: number,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!typeId || typeId <= 0) {
      return {
        success: false,
        error: "ID do tipo inválido",
      };
    }

    // Call API service
    const response = await ProductServiceApi.updateProductType({
      pe_id_produto: productId,
      pe_id_tipo: typeId,
    });

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar tipo do produto";

      return {
        success: false,
        error: errorMessage,
      };
    }

    const spResponse =
      ProductServiceApi.extractStoredProcedureResponse(response);

    return {
      success: true,
      message: spResponse?.sp_message || "Tipo atualizado com sucesso",
    };
  } catch (error) {
    logger.error("Error updating product type:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar tipo";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product brand
 * @param productId - Product ID to update
 * @param brandId - New brand ID
 * @returns Success status and error message if any
 */
export async function updateProductBrand(
  productId: number,
  brandId: number,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!brandId || brandId <= 0) {
      return {
        success: false,
        error: "ID da marca inválido",
      };
    }

    // Call API service
    const response = await ProductServiceApi.updateProductBrand({
      pe_id_produto: productId,
      pe_id_marca: brandId,
    });

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar marca do produto";

      return {
        success: false,
        error: errorMessage,
      };
    }

    const spResponse =
      ProductServiceApi.extractStoredProcedureResponse(response);

    return {
      success: true,
      message: spResponse?.sp_message || "Marca atualizada com sucesso",
    };
  } catch (error) {
    logger.error("Error updating product brand:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar marca";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
