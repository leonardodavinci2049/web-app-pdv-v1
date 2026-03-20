"use server";

import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { searchProductsPdv } from "@/services/api-main/product-pdv/product-pdv-cached-service";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";

const logger = createLogger("sales-dashboard-search-products-action");

export async function searchProductsAction(
  search: string,
): Promise<UIProductPdv[]> {
  try {
    const { apiContext } = await getAuthContext();

    const products = await searchProductsPdv({
      search: search || undefined,
      customerId: 0,
      flagStock: 0,
      limit: 20,
      ...apiContext,
    });

    return products;
  } catch (error) {
    logger.error("Erro ao buscar produtos", error);
    return [];
  }
}
