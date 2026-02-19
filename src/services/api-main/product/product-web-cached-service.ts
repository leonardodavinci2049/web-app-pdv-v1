import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import {
  type CategoryLookupResult,
  findCategoryBySlug,
  transformCategoryMenu,
  transformProductDetail,
  transformProductList,
  transformRelatedProducts,
  type UICategory,
  type UIProduct,
} from "@/lib/transformers";
import { CategoryServiceApi } from "@/services/api-main/category/category-service-api";
import { ProductWebServiceApi } from "@/services/api-main/product/product-service-api";

const logger = createLogger("ProductWebCachedService");

// ============================================================================
// Product Functions
// ============================================================================

/**
 * Fetch all products with cache
 * Uses ProductWebServiceApi.findProducts
 */
export async function getProducts(
  params: {
    taxonomyId?: number;
    brandId?: number;
    limit?: number;
    page?: number;
    searchTerm?: string;
    sortCol?: number;
    sortOrd?: number;
    stockOnly?: boolean;
  } = {},
): Promise<UIProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.products);

  try {
    const response = await ProductWebServiceApi.findProducts({
      pe_id_taxonomy: params.taxonomyId ?? 0,
      pe_id_marca: params.brandId ?? 0,
      pe_qt_registros: params.limit ?? 100,
      pe_pagina_id: params.page ?? 0,
      pe_produto: params.searchTerm ?? "",
      pe_coluna_id: params.sortCol ?? 1,
      pe_ordem_id: params.sortOrd ?? 1,
      pe_flag_estoque: params.stockOnly ? 1 : 0,
    });

    const products = ProductWebServiceApi.extractProductList(response);
    return transformProductList(products);
  } catch (error) {
    // Warn instead of error - this may happen during build when API is unavailable
    if (error instanceof Error && error.message.includes("Connection closed")) {
      logger.warn("API unavailable - returning empty product list");
    } else {
      logger.error("Failed to fetch products:", error);
    }
    return [];
  }
}

/**
 * Fetch a product by ID with cache
 * Uses ProductWebServiceApi.findProductById
 */
export async function getProductById(
  id: string,
): Promise<UIProduct | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.product(id), CACHE_TAGS.products);

  try {
    const response = await ProductWebServiceApi.findProductById({
      pe_id_produto: Number.parseInt(id, 10),
      pe_slug_produto: "",
    });

    const product = ProductWebServiceApi.extractProduct(response);
    if (!product) {
      return undefined;
    }

    return transformProductDetail(product);
  } catch (error) {
    logger.error(`Failed to fetch product by ID ${id}:`, error);
    return undefined;
  }
}

/**
 * Fetch a product by slug with cache
 * Extracts product ID from slug and uses findProductById
 */
export async function getProductBySlug(
  slug: string[],
): Promise<UIProduct | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.products);

  try {
    const fullSlug = slug.join("/");
    // Extract ID from slug (format: product-name-123)
    const parts = fullSlug.split("-");
    const id = parts[parts.length - 1];

    if (!id || Number.isNaN(Number.parseInt(id, 10))) {
      logger.error(`Invalid product slug: ${fullSlug}`);
      return undefined;
    }

    const response = await ProductWebServiceApi.findProductById({
      pe_id_produto: Number.parseInt(id, 10),
      pe_slug_produto: fullSlug,
    });

    const product = ProductWebServiceApi.extractProduct(response);
    if (!product) {
      return undefined;
    }

    return transformProductDetail(product);
  } catch (error) {
    logger.error(`Failed to fetch product by slug:`, error);
    return undefined;
  }
}

/**
 * Result type for getProductWithRelated
 */
export interface ProductWithRelated {
  product: UIProduct;
  relatedProducts: UIProduct[];
}

/**
 * Fetch a product by slug along with related products (from API response data[2])
 * Uses a single API call to get both product and related products
 */
export async function getProductWithRelated(
  slug: string[],
): Promise<ProductWithRelated | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.products);

  try {
    const fullSlug = slug.join("/");
    // Extract ID from slug (format: product-name-123)
    const parts = fullSlug.split("-");
    const id = parts[parts.length - 1];

    if (!id || Number.isNaN(Number.parseInt(id, 10))) {
      logger.error(`Invalid product slug: ${fullSlug}`);
      return undefined;
    }

    const response = await ProductWebServiceApi.findProductById({
      pe_id_produto: Number.parseInt(id, 10),
      pe_slug_produto: fullSlug,
    });

    const product = ProductWebServiceApi.extractProduct(response);
    if (!product) {
      return undefined;
    }

    // Extract related products from data[2] of the API response
    const relatedRaw = ProductWebServiceApi.extractRelatedProducts(response);

    // Transform and filter out current product from related products
    const relatedProducts = transformRelatedProducts(relatedRaw).filter(
      (p) => p.id !== String(product.ID_PRODUTO),
    );

    return {
      product: transformProductDetail(product),
      relatedProducts,
    };
  } catch (error) {
    logger.error(`Failed to fetch product with related by slug:`, error);
    return undefined;
  }
}

/**
 * Fetch related products with cache
 * Uses taxonomy ID to find products in the same category
 */
export async function getRelatedProducts(
  productId: string,
  taxonomyId: string,
): Promise<UIProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.category(taxonomyId));

  try {
    // Validar se taxonomyId é um número válido
    const parsedTaxonomyId = Number.parseInt(taxonomyId, 10);

    // Se taxonomyId for inválido ou 0, retornar array vazio silenciosamente
    // (alguns produtos podem não ter categoria associada)
    if (Number.isNaN(parsedTaxonomyId) || parsedTaxonomyId <= 0) {
      return [];
    }

    const response = await ProductWebServiceApi.findProducts({
      pe_id_taxonomy: parsedTaxonomyId,
      pe_qt_registros: 10,
    });

    const products = ProductWebServiceApi.extractProductList(response);
    // Filter out the current product
    return transformProductList(products).filter((p) => p.id !== productId);
  } catch (error) {
    logger.error(`Failed to fetch related products:`, error);
    return [];
  }
}

/**
 * Fetch products by category with cache
 * Uses pe_id_taxonomy to filter by category
 */
export async function getProductsByCategory(
  categoryId: string,
  subcategoryId?: string,
): Promise<UIProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.category(categoryId));

  try {
    // Use subcategory ID if provided, otherwise use category ID
    const idToUse = subcategoryId || categoryId;
    const taxonomyId = Number.parseInt(idToUse, 10);

    // Se taxonomyId for inválido ou 0, retornar array vazio
    if (Number.isNaN(taxonomyId) || taxonomyId <= 0) {
      logger.warn(`Invalid categoryId/subcategoryId: ${idToUse}`);
      return [];
    }

    const response = await ProductWebServiceApi.findProducts({
      pe_id_taxonomy: taxonomyId,
      pe_qt_registros: 30,
    });

    const products = ProductWebServiceApi.extractProductList(response);
    return transformProductList(products);
  } catch (error) {
    logger.error(`Failed to fetch products by category:`, error);
    return [];
  }
}

/**
 * Fetch products by taxonomy slug with cache
 * Uses pe_slug_taxonomy to filter by category slug from URL
 */
export async function getProductsBySlug(
  slugTaxonomy: string,
  limit = 30,
  page = 0,
  sortCol = 1,
  sortOrd = 1,
): Promise<UIProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.category(slugTaxonomy));

  try {
    const response = await ProductWebServiceApi.findProducts({
      pe_slug_taxonomy: slugTaxonomy,
      pe_qt_registros: limit,
      pe_pagina_id: page,
      pe_coluna_id: sortCol,
      pe_ordem_id: sortOrd,
    });

    const products = ProductWebServiceApi.extractProductList(response);
    return transformProductList(products);
  } catch (error) {
    logger.error(`Failed to fetch products by slug:`, error);
    return [];
  }
}

/**
 * Fetch products by taxonomy - uses both slug and ID for best results
 * @param slugOrId - Can be a slug string or taxonomy ID
 * @param taxonomyId - Optional taxonomy ID to use for filtering
 * @param stockOnly - If true, returns only products with stock
 */
export async function getProductsByTaxonomy(
  slugOrId: string,
  taxonomyId?: number,
  limit = 30,
  page = 0,
  sortCol = 1,
  sortOrd = 1,
  stockOnly?: boolean,
): Promise<UIProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.category(slugOrId));

  const stockFlag = stockOnly ? 1 : 0;

  try {
    // Fazer UMA ÚNICA chamada à API enviando tanto ID quanto slug
    // A API decide qual usar baseado nos parâmetros fornecidos
    const response = await ProductWebServiceApi.findProducts({
      pe_id_taxonomy: taxonomyId && taxonomyId > 0 ? taxonomyId : 0,
      pe_slug_taxonomy: slugOrId,
      pe_qt_registros: limit,
      pe_pagina_id: page,
      pe_coluna_id: sortCol,
      pe_ordem_id: sortOrd,
      pe_flag_estoque: stockFlag,
    });

    const products = ProductWebServiceApi.extractProductList(response);

    // Se não encontrou produtos, retornar array vazio
    if (products.length === 0) {
      logger.info(
        `No products found for taxonomy: ${slugOrId} (ID: ${taxonomyId})`,
      );
      return [];
    }

    return transformProductList(products);
  } catch (error) {
    logger.error(`Failed to fetch products by taxonomy:`, error);
    return [];
  }
}

// ============================================================================
// Category Functions
// ============================================================================

// pe_id_tipo: 1 = menu hierárquico completo (conforme teste Postman)
// pe_parent_id: 0 = buscar a partir da raiz
const CATEGORY_MENU_TYPE_ID = 1;
const CATEGORY_PARENT_ID = 0;

/**
 * Fetch all categories (menu) with cache
 * Uses CategoryServiceApi.findMenu
 */
export async function getCategories(): Promise<UICategory[]> {
  "use cache";
  cacheLife("quarter");
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.navigation);

  try {
    const response = await CategoryServiceApi.findMenu({
      pe_id_tipo: CATEGORY_MENU_TYPE_ID,
      pe_parent_id: CATEGORY_PARENT_ID,
    });

    const menu = CategoryServiceApi.extractCategories(response);

    if (menu.length === 0) {
      logger.warn("No categories found in menu response");
    }

    const transformed = transformCategoryMenu(menu);

    return transformed;
  } catch (error) {
    logger.error("Failed to fetch categories:", error);
    return [];
  }
}

/**
 * Fetch category by slug with cache
 * Searches the hierarchical menu structure for matching slug
 */
export async function getCategoryBySlug(
  categorySlug: string,
  subcategorySlug?: string,
): Promise<CategoryLookupResult | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.categories);

  try {
    const categories = await getCategories();
    return findCategoryBySlug(categories, categorySlug, subcategorySlug);
  } catch (error) {
    logger.error(`Failed to fetch category by slug:`, error);
    return null;
  }
}
