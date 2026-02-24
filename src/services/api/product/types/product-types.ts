/**
 * TypeScript types and interfaces for Product API Service
 * Based on API Reference: .github/api-reference/api-product-reference.md
 */

/**
 * Custom error class for product-related errors
 */
export class ProductError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "ProductError";
    Object.setPrototypeOf(this, ProductError.prototype);
  }
}

/**
 * Error thrown when product is not found
 */
export class ProductNotFoundError extends ProductError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Produto não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Produto não encontrado";
    super(message, "PRODUCT_NOT_FOUND", 100404);
    this.name = "ProductNotFoundError";
    Object.setPrototypeOf(this, ProductNotFoundError.prototype);
  }
}

/**
 * Error thrown when product validation fails
 */
export class ProductValidationError extends ProductError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PRODUCT_VALIDATION_ERROR", 100400);
    this.name = "ProductValidationError";
    Object.setPrototypeOf(this, ProductValidationError.prototype);
  }
}

// ========================================
// BASE INTERFACES
// ========================================

/**
 * Base request interface with common parameters
 * All parameters are optional as they are automatically filled from environment variables
 */
interface BaseProductRequest {
  pe_app_id?: number; // (variável de ambiente)
  pe_system_client_id?: number; // (variável de ambiente)
  pe_store_id?: number; // (variável de ambiente)
  pe_organization_id?: string; // (variável de ambiente)
  pe_member_id?: string; // (variável de ambiente)
  pe_user_id?: string; // (variável de ambiente)
  pe_person_id?: number; // (variável de ambiente)
}

/**
 * Stored procedure response structure
 */
export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

/**
 * MySQL metadata structure
 */
export interface MySQLMetadata {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  info: string;
  serverStatus: number;
  warningStatus: number;
  changedRows: number;
}

/**
 * Base response interface
 */
interface BaseProductResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  info1: string;
}

// ========================================
// DATA TYPES
// ========================================

/**
 * Product detail data structure (ENDPOINT 1)
 * Based on actual API response from product-find-id endpoint
 */
export interface ProductDetail {
  ID_PRODUTO: number; // Correct field name from API (was ID_TBL_PRODUTO)
  SKU: number;
  PRODUTO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  ID_IMAGEM: number;
  PATH_IMAGEM: string;
  SLUG: string | null;
  ID_IMAGEM_MARCA: number;
  ID_TIPO: number;
  TIPO: string; // Product type name
  ID_MARCA: number;
  MARCA: string; // Brand name (API returns MARCA, not MARCA_NOME)
  ID_FORNECEDOR: number;
  FORNECEDOR: string; // Supplier name
  ID_FAMILIA: number;
  ID_GRUPO: number;
  ID_SUBGRUPO: number;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  OURO: string; // Price level 1
  PRATA: string; // Price level 2
  BRONZE: string; // Price level 3
  ESTOQUE_LOJA: number; // Stock quantity from API
  TEMPODEGARANTIA_DIA: number; // API returns days
  PESO_GR: number;
  COMPRIMENTO_MM: number;
  LARGURA_MM: number;
  ALTURA_MM: number;
  DIAMETRO_MM: number;
  CFOP: string; // Código Fiscal de Operações e Prestações
  CST: string; // Código de Situação Tributária
  EAN: string; // Código de Barras EAN
  NCM: number; // Nomenclatura Comum do Mercosul
  NBM: string; // Nomenclatura Brasileira de Mercadorias
  PPB: number; // Percentual de Conteúdo de Importação
  TEMP: string; // Campo temporário/auxiliar
  FLAG_CONTROLE_FISICO: number; // 1 = SIM / 0 = NÃO
  CONTROLAR_ESTOQUE: number; // 1 = SIM / 0 = NÃO
  CONSIGNADO: number; // 1 = SIM / 0 = NÃO
  DESTAQUE: number; // 1 = SIM / 0 = NÃO
  PROMOCAO: number; // 1 = SIM / 0 = NÃO
  FLAG_SERVICO: number; // 1 = SIM / 0 = NÃO
  FLAG_WEBSITE_OFF: number; // 1 = OFF / 0 = ON
  INATIVO: number; // 2 = Ativo / 1 = Inativo
  IMPORTADO: number; // 1 = SIM / 2 = NÃO
  DESCRICAO_VENDA: string | null; // Short description for sales
  ANOTACOES: string | null; // Product description/notes - used in description tab
  META_TITLE: string; // SEO meta title
  META_DESCRIPTION: string; // SEO meta description
  DT_UPDATE: string; // Last update date
  DATADOCADASTRO: string; // Creation date
}

/**
 * Product related taxonomy/category structure
 * Returned in the second array of findProductById response
 */
export interface ProductRelatedTaxonomy {
  ID_TAXONOMY: number;
  PARENT_ID: number;
  TAXONOMIA: string;
  SLUG: string | null;
  ORDEM: number;
  LEVEL: number | null;
}

/**
 * Product supplier structure
 * Returned in the third array of findProductById response
 */
export interface ProductSupplier {
  ID_FORNECEDOR: number;
  ID_PRODUTO: number;
  FORNECEDOR: string;
  CODIGODOPRODUTO: string;
  DT_CADASTRO: string;
}

/**
 * Product list item data structure (ENDPOINT 2)
 */
export interface ProductListItem {
  ID_PRODUTO: number;
  ID_POST: number;
  PRODUTO: string;
  DESCRICAO_TAB: string;
  SKU: number;
  ID_TIPO: number;
  TIPO: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  ESTOQUE_LOJA: number;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
  OURO: string;
  PRATA: string;
  BRONZE: string;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  TX_PRODUTO_LOJA: string;
  DECONTO: string;
  TEMPODEGARANTIA_MES: number;
  TEMPODEGARANTIA_DIA: number;
  DESCRICAO_VENDA: string;
  ID_MARCA: number;
  MARCA_NOME: string;
  ID_IMAGEM_MARCA: number;
  ID_IMAGEM: number;
  PATH_IMAGEM: string;
  SLUG: string;
  CATEGORIAS: string | null; // Array de categorias em formato JSON string
  DATADOCADASTRO: string;
}

// ========================================
// REQUEST TYPES - QUERY ENDPOINTS
// ========================================

/**
 * Request for finding product by ID (ENDPOINT 1)
 * Based on API Reference: product-find-id.md
 */
export interface FindProductByIdRequest extends BaseProductRequest {
  pe_type_business: number; // 1 = B2B, 2 = B2C
  pe_id_produto: number;
  pe_slug_produto?: string; // Optional - for validation or URL-friendly systems
}

/**
 * Request for listing products (ENDPOINT 2)
 * Based on API Reference: product-find.md
 */
export interface FindProductsRequest extends BaseProductRequest {
  // Filtros (opcionais)
  pe_id_taxonomy?: number; // Filtrar por taxonomia/categoria (default: 0)
  pe_slug_taxonomy?: string; // slug da categoria (default: vazio)
  pe_id_produto?: number; // Filtrar por ID específico (default: 0)
  pe_produto?: string; // Busca por nome (LIKE)(default: vazio)
  pe_flag_estoque?: number; // 1 = apenas com estoque
  pe_flag_inativo?: number; // 0 = ativos, 1 = inativos

  // Paginação (opcionais)
  pe_qt_registros?: number; // Quantidade por página (default: 20)
  pe_pagina_id?: number; // Página atual (default: 0)
  pe_coluna_id?: number; // Coluna para ordenação (default: 1)
  pe_ordem_id?: number; // 1 = ASC, 2 = DESC (default: 1)
}

// ========================================
// REQUEST TYPES - CREATE ENDPOINT
// ========================================

/**
 * Request for creating a new product (ENDPOINT 6)
 */
export interface CreateProductRequest extends BaseProductRequest {
  pe_type_business: number;
  pe_nome_produto: string;
  pe_slug: string;
  pe_descricao_tab?: string;
  pe_etiqueta?: string;
  pe_ref?: string;
  pe_modelo?: string;
  pe_id_fornecedor?: number;
  pe_id_tipo?: number;
  pe_id_marca?: number;
  pe_id_familia?: number;
  pe_id_grupo?: number;
  pe_id_subgrupo?: number;
  pe_peso_gr?: number;
  pe_comprimento_mm?: number;
  pe_largura_mm?: number;
  pe_altura_mm?: number;
  pe_diametro_mm?: number;
  pe_tempodegarantia_mes?: number;
  pe_vl_venda_atacado?: number;
  pe_vl_venda_varejo?: number;
  pe_vl_corporativo?: number;
  pe_qt_estoque?: number;
  pe_flag_website_off?: number;
  pe_flag_importado?: number;
  pe_info?: string;
}

// ========================================
// REQUEST TYPES - UPDATE ENDPOINTS
// ========================================

/**
 * Request for updating general product data (ENDPOINT 7)
 */
export interface UpdateProductGeneralRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_nome_produto: string;
  pe_ref: string;
  pe_modelo: string;
  pe_etiqueta: string;
  pe_descricao_tab: string;
}

/**
 * Request for updating product name (ENDPOINT 8)
 */
export interface UpdateProductNameRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_nome_produto: string;
}

/**
 * Request for updating product type (ENDPOINT 9)
 */
export interface UpdateProductTypeRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_id_tipo: number;
}

/**
 * Request for updating product brand (ENDPOINT 10)
 */
export interface UpdateProductBrandRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_id_marca: number;
}

/**
 * Request for updating product stock (ENDPOINT 11)
 */
export interface UpdateProductStockRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_qt_estoque: number;
  pe_qt_minimo: number;
}

/**
 * Request for updating product prices (ENDPOINT 12)
 */
export interface UpdateProductPriceRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_preco_venda_atac: number;
  pe_preco_venda_corporativo: number;
  pe_preco_venda_vare: number;
}

/**
 * Request for updating product flags (ENDPOINT 13)
 */
export interface UpdateProductFlagsRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_flag_inativo: number;
  pe_flag_importado: number;
  pe_flag_controle_fisico: number;
  pe_flag_controle_estoque: number;
  pe_flag_destaque: number;
  pe_flag_promocao: number;
  pe_flag_descontinuado: number;
  pe_flag_servico: number;
  pe_flag_website_off: number;
}

/**
 * Request for updating product characteristics (ENDPOINT 14)
 */
export interface UpdateProductCharacteristicsRequest
  extends BaseProductRequest {
  pe_id_produto: number;
  pe_peso_gr: number;
  pe_comprimento_mm: number;
  pe_largura_mm: number;
  pe_altura_mm: number;
  pe_diametro_mm: number;
  pe_tempodegarantia_dia: number;
  pe_tempodegarantia_mes: number;
}

/**
 * Request for updating product tax values (ENDPOINT 15)
 */
export interface UpdateProductTaxValuesRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_cfop: string;
  pe_cst: string;
  pe_ean: string;
  pe_nbm: string;
  pe_ncm: number;
  pe_ppb: number;
  pe_temp: number;
}

/**
 * Request for updating product short description (ENDPOINT 16)
 */
export interface UpdateProductShortDescriptionRequest
  extends BaseProductRequest {
  pe_id_produto: number;
  pe_descricao_venda: string;
}

/**
 * Request for updating product full description (ENDPOINT 17)
 */
export interface UpdateProductDescriptionRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_produto_descricao: string;
}

/**
 * Request for updating various product data (ENDPOINT 18)
 */
export interface UpdateProductVariousRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_nome_produto: string;
}

/**
 * Request for updating product image path (ENDPOINT 19)
 */
export interface UpdateProductImagePathRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_path_imagem: string;
}

/**
 * Request for updating product metadata (ENDPOINT 20)
 */
export interface UpdateProductMetadataRequest extends BaseProductRequest {
  pe_id_produto: number;
  pe_meta_title: string;
  pe_meta_description: string;
}

// ========================================
// RESPONSE TYPES - QUERY ENDPOINTS
// ========================================

/**
 * Response for finding product by ID (ENDPOINT 1)
 * Based on API Reference: product-find-id.md
 * data[0] = Product details array
 * data[1] = Related taxonomies/categories array
 * data[2] = Suppliers array
 * data[3] = Stored procedure response
 * data[4] = MySQL metadata
 */
export interface FindProductByIdResponse extends BaseProductResponse {
  data: [
    ProductDetail[],
    ProductRelatedTaxonomy[],
    ProductSupplier[],
    [StoredProcedureResponse],
    MySQLMetadata,
  ];
}

/**
 * Response for listing products (ENDPOINT 2)
 */
export interface FindProductsResponse extends BaseProductResponse {
  data: [ProductListItem[], MySQLMetadata];
}

// ========================================
// RESPONSE TYPES - CREATE/UPDATE ENDPOINTS
// ========================================

/**
 * Response for creating a product (ENDPOINT 6)
 */
export interface CreateProductResponse extends BaseProductResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Response for updating product (ENDPOINTS 7-18)
 */
export interface UpdateProductResponse extends BaseProductResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}
