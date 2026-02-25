import "server-only";

interface ProductPdvBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface ProductPdvBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

// --- Request Interfaces ---

export interface ProductPdvFindAllRequest extends ProductPdvBaseRequest {
  pe_search?: string;
  pe_taxonomy_id?: number;
  pe_type_id?: number;
  pe_brand_id?: number;
  pe_flag_stock?: number;
  pe_flag_service?: number;
  pe_records_quantity?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface ProductPdvFindByIdRequest extends ProductPdvBaseRequest {
  pe_product_id?: number;
  pe_type_business?: number;
}

export interface ProductPdvFindSearchRequest extends ProductPdvBaseRequest {
  pe_customer_id?: number;
  pe_search?: string;
  pe_flag_stock?: number;
  pe_limit?: number;
}

// --- Entity Interfaces (campos retornados pela API) ---

export interface ProductPdvListItem {
  ID_PRODUTO: number;
  SKU: number;
  PRODUTO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  ID_TIPO: number;
  TIPO: string;
  ID_MARCA: number;
  MARCA: string;
  PATH_IMAGEM_MARCA: string;
  ID_IMAGEM: number;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  SLUG: string;
  ESTOQUE_LOJA: number;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  TX_PRODUTO_LOJA: string;
  OURO: string;
  PRATA: string;
  BRONZE: string;
  DECONTO: string;
  TEMPODEGARANTIA_MES: number;
  TEMPODEGARANTIA_DIA: number;
  DESCRICAO_VENDA: string | null;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
  CATEGORIAS: string;
  DATADOCADASTRO: string;
}

export interface ProductPdvSearchItem {
  ID_PRODUTO: number;
  SKU: number;
  PRODUTO: string;
  ESTOQUE_LOJA: number;
  TIPO_VALOR: string;
  VALOR_PRODUTO: string;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  ID_TIPO: number;
  TIPO: string;
  ID_MARCA: number;
  MARCA: string;
  PATH_IMAGEM_MARCA: string;
  ID_IMAGEM: number;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  SLUG: string;
  TX_PRODUTO_LOJA: string;
  OURO: string;
  PRATA: string;
  BRONZE: string;
  DECONTO: string;
  TEMPODEGARANTIA_MES: number;
  TEMPODEGARANTIA_DIA: number;
  DESCRICAO_VENDA: string | null;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
  DATADOCADASTRO: string;
}

export interface ProductPdvDetail {
  ID_PRODUTO: number;
  SKU: number;
  PRODUTO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  SLUG: string;
  ID_TIPO: number;
  TIPO: string;
  ID_MARCA: number;
  MARCA: string;
  PATH_IMAGEM_MARCA: string;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  OURO: string;
  PRATA: string;
  BRONZE: string;
  ESTOQUE_LOJA: number;
  TEMPODEGARANTIA_DIA: number;
  PESO_GR: number;
  COMPRIMENTO_MM: number;
  LARGURA_MM: number;
  ALTURA_MM: number;
  DIAMETRO_MM: number;
  DESTAQUE: number;
  PROMOCAO: number;
  FLAG_SERVICO: number;
  IMPORTADO: number;
  DESCRICAO_VENDA: string | null;
  ANOTACOES: string | null;
  DATADOCADASTRO: string;
}

export interface ProductPdvRelatedCategory {
  ID_TAXONOMY: number;
  PARENT_ID: number;
  TAXONOMIA: string;
  SLUG: string;
  ORDEM: number;
  LEVEL: number;
}

export interface ProductPdvRelatedProduct {
  ID_TAXONOMY: number;
  SKU: number;
  PRODUTO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  PATH_IMAGEM: string;
  SLUG: string;
  ESTOQUE_LOJA: number;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
}

// --- Response Interfaces ---

export interface ProductPdvFindAllResponse extends ProductPdvBaseResponse {
  data: Record<string, ProductPdvListItem[]>;
}

export interface ProductPdvFindByIdData {
  "Product Pdv find Id": ProductPdvDetail[];
  "Related Categories": ProductPdvRelatedCategory[];
  "Related Products": ProductPdvRelatedProduct[];
}

export interface ProductPdvFindByIdResponse extends ProductPdvBaseResponse {
  data: ProductPdvFindByIdData;
}

export interface ProductPdvFindSearchResponse extends ProductPdvBaseResponse {
  data: Record<string, ProductPdvSearchItem[]>;
}

// --- Error Classes ---

export class ProductPdvError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "ProductPdvError";
    Object.setPrototypeOf(this, ProductPdvError.prototype);
  }
}

export class ProductPdvNotFoundError extends ProductPdvError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Produto PDV não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Produto PDV não encontrado";
    super(message, "PRODUCT_PDV_NOT_FOUND", 100404);
    this.name = "ProductPdvNotFoundError";
    Object.setPrototypeOf(this, ProductPdvNotFoundError.prototype);
  }
}

export class ProductPdvValidationError extends ProductPdvError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PRODUCT_PDV_VALIDATION_ERROR", 100400);
    this.name = "ProductPdvValidationError";
    Object.setPrototypeOf(this, ProductPdvValidationError.prototype);
  }
}
