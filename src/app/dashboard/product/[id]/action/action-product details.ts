"use server";

import { createLogger } from "@/lib/logger";
import { ProductServiceApi } from "@/services/api/product/product-service-api";
import type {
  ProductDetail,
  ProductRelatedTaxonomy,
} from "@/services/api/product/types/product-types";

const logger = createLogger("ActionProductDetails");

interface FetchProductDetailsResult {
  success: boolean;
  product: ProductDetail | null;
  relatedTaxonomies: ProductRelatedTaxonomy[];
}

/**
 * Busca os detalhes de um produto pelo ID.
 * Retorna o produto e suas taxonomias relacionadas.
 */
export async function fetchProductDetails(
  productId: number,
): Promise<FetchProductDetailsResult> {
  try {
    const response = await ProductServiceApi.findProductById({
      pe_type_business: 1,
      pe_id_produto: productId,
      pe_slug_produto: "",
    });

    if (!ProductServiceApi.isValidProductDetailResponse(response)) {
      logger.error("Invalid product detail response:", response);
      return { success: false, product: null, relatedTaxonomies: [] };
    }

    const product = ProductServiceApi.extractProductDetail(response);
    const relatedTaxonomies =
      ProductServiceApi.extractRelatedTaxonomies(response);

    if (!product) {
      logger.error("Product not found in response:", response);
      return { success: false, product: null, relatedTaxonomies: [] };
    }

    return { success: true, product, relatedTaxonomies };
  } catch (error) {
    logger.error("Error fetching product details:", error);
    return { success: false, product: null, relatedTaxonomies: [] };
  }
}
