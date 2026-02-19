/**
 * Data Transformers
 *
 * Transforms API response types to UI-friendly types.
 * Centralizes data mapping logic for products and categories.
 */

import "server-only";
import type {
  ProductWebDetail,
  ProductWebListItem,
  ProductWebRelatedItem,
} from "@/services/api-main/product/types/product-types";

// ============================================================================
// Constants
// ============================================================================

export const PLACEHOLDER_IMAGE = "/images/product/no-image.jpeg";

// ============================================================================
// UI Types
// ============================================================================

export interface UIProduct {
  id: string;
  sku?: string;
  slug?: string;
  name: string;
  description: string | null;
  price: number;
  image: string;
  categoryId: string;
  category?: string;
  subcategoryId?: string;
  inStock: boolean;
  stock: number;
  brand?: string;
  isNew?: boolean;
  discount?: number;
  specifications?: Record<string, unknown>;
  shipping?: Record<string, unknown>;
}

export interface UISubcategory {
  id: string;
  name: string;
  slug: string;
  href: string;
  children?: UISubcategory[]; // Level 3 - subgrupos
}

export interface UICategory {
  id: string;
  name: string;
  slug: string;
  href: string;
  iconName?: string;
  subcategories?: UISubcategory[]; // Level 2 - grupos
}

export interface CategoryLookupResult {
  category: UICategory;
  subcategory: UISubcategory | null;
}

// ============================================================================
// Product Transformers
// ============================================================================

/**
 * Safely parses a price string to number
 */
function parsePrice(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Gets image path with fallback to placeholder
 */
function getImagePath(path: string | null | undefined): string {
  return path && path.trim() !== "" ? path : PLACEHOLDER_IMAGE;
}

/**
 * Transforms a ProductWebListItem from API to UIProduct for UI components
 */
export function transformProductListItem(item: ProductWebListItem): UIProduct {
  return {
    id: String(item.ID_PRODUTO),
    sku: item.SKU ? String(item.SKU) : undefined,
    slug: item.SLUG ?? undefined,
    name: item.PRODUTO ?? "Produto sem nome",
    description: item.DESCRICAO_TAB ?? item.DESCRICAO_VENDA ?? null,
    price: parsePrice(item.VL_VAREJO),
    image: getImagePath(item.PATH_IMAGEM),
    categoryId: "", // Will be set from taxonomy context
    category: "", // Will be set from taxonomy context
    subcategoryId: undefined,
    inStock: item.ESTOQUE_LOJA > 0,
    stock: item.ESTOQUE_LOJA,
    brand: item.MARCA ?? undefined,
    isNew: item.LANCAMENTO === 1,
    discount: item.PROMOCAO === 1 ? calculateDiscount(item) : undefined,
  };
}

/**
 * Transforms multiple ProductWebListItem to UIProduct array
 */
export function transformProductList(items: ProductWebListItem[]): UIProduct[] {
  return items.map(transformProductListItem);
}

/**
 * Calculates discount percentage if promotion is active
 */
function calculateDiscount(item: ProductWebListItem): number | undefined {
  // If DECONTO field exists and has value, use it
  if (item.DECONTO) {
    const discount = parsePrice(item.DECONTO);
    if (discount > 0) return discount;
  }
  return undefined;
}

/**
 * Transforms a ProductWebDetail from API to UIProduct for product detail page
 */
export function transformProductDetail(detail: ProductWebDetail): UIProduct {
  return {
    id: String(detail.ID_PRODUTO),
    sku: detail.SKU ? String(detail.SKU) : undefined,
    slug: detail.SLUG ?? undefined,
    name: detail.PRODUTO,
    description:
      detail.ANOTACOES ??
      detail.DESCRICAO_TAB ??
      detail.DESCRICAO_VENDA ??
      null,
    price: parsePrice(detail.VL_VAREJO),
    image: getImagePath(detail.PATH_IMAGEM),
    categoryId: detail.ID_FAMILIA ? String(detail.ID_FAMILIA) : "",
    category: undefined,
    subcategoryId: detail.ID_GRUPO ? String(detail.ID_GRUPO) : undefined,
    inStock: detail.ESTOQUE_LOJA > 0,
    stock: detail.ESTOQUE_LOJA,
    brand: detail.MARCA ?? undefined,
    isNew: detail.LANCAMENTO === 1,
    discount: detail.PROMOCAO === 1 ? undefined : undefined, // Calculate from price difference if needed
    specifications: buildSpecifications(detail),
    shipping: buildShippingInfo(detail),
  };
}

/**
 * Builds specifications object from product detail
 */
function buildSpecifications(
  detail: ProductWebDetail,
): Record<string, unknown> {
  return {
    sku: detail.SKU,
    model: detail.MODELO,
    reference: detail.REF,
    weight: detail.PESO_GR,
    dimensions: {
      length: detail.COMPRIMENTO_MM,
      width: detail.LARGURA_MM,
      height: detail.ALTURA_MM,
      diameter: detail.DIAMETRO_MM,
    },
    warranty: detail.TEMPODEGARANTIA_DIA,
    ean: detail.EAN,
    ncm: detail.NCM,
  };
}

/**
 * Builds shipping info from product detail
 */
function buildShippingInfo(detail: ProductWebDetail): Record<string, unknown> {
  return {
    weight: detail.PESO_GR,
    length: detail.COMPRIMENTO_MM,
    width: detail.LARGURA_MM,
    height: detail.ALTURA_MM,
  };
}

/**
 * Transforms ProductWebRelatedItem to UIProduct for related products
 */
export function transformRelatedProduct(
  item: ProductWebRelatedItem,
): UIProduct {
  return {
    id: String(item.SKU ?? 0),
    sku: item.SKU ? String(item.SKU) : undefined,
    slug: item.SLUG ?? undefined,
    name: item.PRODUTO ?? "",
    description: item.DESCRICAO_TAB ?? null,
    price: parsePrice(item.VL_VAREJO),
    image: getImagePath(item.PATH_IMAGEM),
    categoryId: item.ID_TAXONOMY ? String(item.ID_TAXONOMY) : "",
    category: "",
    inStock: (item.ESTOQUE_LOJA ?? 0) > 0,
    stock: item.ESTOQUE_LOJA ?? 0,
    brand: undefined,
    isNew: item.LANCAMENTO === 1,
    discount: item.PROMOCAO === 1 ? undefined : undefined,
  };
}

/**
 * Transforms multiple ProductWebRelatedItem to UIProduct array
 */
export function transformRelatedProducts(
  items: ProductWebRelatedItem[],
): UIProduct[] {
  return items.map(transformRelatedProduct);
}
