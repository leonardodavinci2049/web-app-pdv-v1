import type {
  ProductPdvDetail,
  ProductPdvListItem,
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
  imagePath?: string;
  pagePath?: string;
  slug?: string;
  storeStock: number;
  wholesalePrice: string;
  corporatePrice: string;
  retailPrice: string;
  goldPrice: string;
  silverPrice: string;
  bronzePrice: string;
  discount: string;
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
  createdAt?: string;
}

export function transformProductPdvListItem(
  entity: ProductPdvListItem,
): UIProductPdv {
  return {
    id: entity.ID_PRODUTO,
    taxonomyId: entity.ID_TAXONOMY,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    type: entity.TIPO,
    brand: entity.MARCA,
    brandImagePath: entity.PATH_IMAGEM_MARCA || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
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

export function transformProductPdvList(
  items: ProductPdvListItem[],
): UIProductPdv[] {
  return items.map(transformProductPdvListItem);
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
