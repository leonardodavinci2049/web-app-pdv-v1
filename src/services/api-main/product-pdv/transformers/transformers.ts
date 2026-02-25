import type {
  ProductPdvDetail,
  ProductPdvListItem,
  ProductPdvRelatedCategory,
  ProductPdvRelatedProduct,
  ProductPdvSearchItem,
} from "../types/product-pdv-types";

export interface UIProductPdv {
  id: number;
  taxonomyId?: number;
  sku: number;
  name: string;
  shortDescription: string;
  label: string;
  ref: string;
  model: string;
  type: string;
  typeId?: number;
  brand: string;
  brandId?: number;
  brandImagePath?: string;
  imageId?: number;
  imagePath?: string;
  pagePath?: string;
  slug?: string;
  storeStock: number;
  wholesalePrice: string;
  corporatePrice: string;
  retailPrice: string;
  storeFee?: string;
  goldPrice: string;
  silverPrice: string;
  bronzePrice: string;
  discount: string;
  warrantyMonths?: number;
  warrantyDays: number;
  weightGr?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  diameterMm?: number;
  salesDescription?: string;
  notes?: string;
  imported: boolean;
  promotion: boolean;
  launch: boolean;
  featured?: boolean;
  isService?: boolean;
  categories?: string;
  createdAt?: string;
}

export function transformProductPdvListItem(
  entity: ProductPdvListItem,
): UIProductPdv {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    type: entity.TIPO,
    typeId: entity.ID_TIPO,
    brand: entity.MARCA,
    brandId: entity.ID_MARCA,
    brandImagePath: entity.PATH_IMAGEM_MARCA || undefined,
    imageId: entity.ID_IMAGEM,
    imagePath: entity.PATH_IMAGEM || undefined,
    pagePath: entity.PATH_PAGE || undefined,
    slug: entity.SLUG || undefined,
    storeStock: entity.ESTOQUE_LOJA,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    storeFee: entity.TX_PRODUTO_LOJA,
    goldPrice: entity.OURO,
    silverPrice: entity.PRATA,
    bronzePrice: entity.BRONZE,
    discount: entity.DECONTO,
    warrantyMonths: entity.TEMPODEGARANTIA_MES,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    salesDescription: entity.DESCRICAO_VENDA ?? undefined,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: entity.LANCAMENTO === 1,
    categories: entity.CATEGORIAS || undefined,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformProductPdvList(
  items: ProductPdvListItem[],
): UIProductPdv[] {
  return items.map(transformProductPdvListItem);
}

export function transformProductPdvSearchItem(
  entity: ProductPdvSearchItem,
): UIProductPdv {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    type: entity.TIPO,
    typeId: entity.ID_TIPO,
    brand: entity.MARCA,
    brandId: entity.ID_MARCA,
    brandImagePath: entity.PATH_IMAGEM_MARCA || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    pagePath: entity.PATH_PAGE || undefined,
    slug: entity.SLUG || undefined,
    storeStock: entity.ESTOQUE_LOJA,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    goldPrice: entity.OURO,
    silverPrice: entity.PRATA,
    bronzePrice: entity.BRONZE,
    discount: entity.DECONTO,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    salesDescription: entity.DESCRICAO_VENDA ?? undefined,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: entity.LANCAMENTO === 1,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformProductPdvSearchList(
  items: ProductPdvSearchItem[],
): UIProductPdv[] {
  return items.map(transformProductPdvSearchItem);
}

export function transformProductPdvDetail(
  entity: ProductPdvDetail,
): UIProductPdv {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    type: entity.TIPO,
    typeId: entity.ID_TIPO,
    brand: entity.MARCA,
    brandId: entity.ID_MARCA,
    brandImagePath: entity.PATH_IMAGEM_MARCA || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    pagePath: entity.PATH_PAGE || undefined,
    slug: entity.SLUG || undefined,
    storeStock: entity.ESTOQUE_LOJA,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    goldPrice: entity.OURO,
    silverPrice: entity.PRATA,
    bronzePrice: entity.BRONZE,
    discount: "0.000000",
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    weightGr: entity.PESO_GR,
    lengthMm: entity.COMPRIMENTO_MM,
    widthMm: entity.LARGURA_MM,
    heightMm: entity.ALTURA_MM,
    diameterMm: entity.DIAMETRO_MM,
    salesDescription: entity.DESCRICAO_VENDA ?? undefined,
    notes: entity.ANOTACOES ?? undefined,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: false,
    featured: entity.DESTAQUE === 1,
    isService: entity.FLAG_SERVICO === 1,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformProductPdvDetailList(
  items: ProductPdvDetail[],
): UIProductPdv[] {
  return items.map(transformProductPdvDetail);
}

export function transformProductPdv(
  entity: ProductPdvListItem | ProductPdvDetail | null | undefined,
): UIProductPdv | null {
  if (!entity) return null;

  if ("ANOTACOES" in entity) {
    return transformProductPdvDetail(entity as ProductPdvDetail);
  }

  return transformProductPdvListItem(entity as ProductPdvListItem);
}

// --- Related Categories ---

export interface UIProductPdvRelatedCategory {
  taxonomyId: number;
  parentId: number;
  name: string;
  slug: string;
  order: number;
  level: number;
}

export function transformRelatedCategory(
  entity: ProductPdvRelatedCategory,
): UIProductPdvRelatedCategory {
  return {
    taxonomyId: entity.ID_TAXONOMY,
    parentId: entity.PARENT_ID,
    name: entity.TAXONOMIA,
    slug: entity.SLUG,
    order: entity.ORDEM,
    level: entity.LEVEL,
  };
}

export function transformRelatedCategories(
  items: ProductPdvRelatedCategory[],
): UIProductPdvRelatedCategory[] {
  return items.map(transformRelatedCategory);
}

// --- Related Products ---

export interface UIProductPdvRelatedProduct {
  taxonomyId: number;
  sku: number;
  name: string;
  shortDescription: string;
  label: string;
  ref: string;
  model: string;
  imagePath?: string;
  slug?: string;
  storeStock: number;
  wholesalePrice: string;
  corporatePrice: string;
  retailPrice: string;
  imported: boolean;
  promotion: boolean;
  launch: boolean;
}

export function transformRelatedProduct(
  entity: ProductPdvRelatedProduct,
): UIProductPdvRelatedProduct {
  return {
    taxonomyId: entity.ID_TAXONOMY,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    imagePath: entity.PATH_IMAGEM || undefined,
    slug: entity.SLUG || undefined,
    storeStock: entity.ESTOQUE_LOJA,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: entity.LANCAMENTO === 1,
  };
}

export function transformRelatedProducts(
  items: ProductPdvRelatedProduct[],
): UIProductPdvRelatedProduct[] {
  return items.map(transformRelatedProduct);
}
