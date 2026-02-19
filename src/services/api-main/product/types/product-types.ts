/**
 * Tipos e interfaces utilizados pelo ProductWebServiceApi
 */

/**
 * Estrutura base para requisições que exigem contexto de tenant
 */
interface ProductWebBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_member_id?: string;
  pe_user_id?: string;
  pe_person_id?: number;
}

/**
 * Estrutura padrão de resposta com metadados do MySQL
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
 * Estrutura padrão de retorno das stored procedures
 */
export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

/**
 * Dados detalhados retornados pelo endpoint product-web-find-id
 */
export interface ProductWebDetail {
  ID_PRODUTO: number;
  SKU?: number | null;
  PRODUTO: string;
  DESCRICAO_TAB: string | null;
  ETIQUETA: string | null;
  REF: string | null;
  MODELO: string | null;
  ID_IMAGEM?: number | null;
  PATH_IMAGEM: string | null;
  SLUG: string | null;
  ID_IMAGEM_MARCA?: number | null;
  PATH_IMAGEM_MARCA: string | null;
  ID_TIPO: number | null;
  TIPO: string | null;
  ID_MARCA: number | null;
  MARCA: string | null;
  ID_FORNECEDOR?: number | null;
  FORNECEDOR?: string | null;
  ID_FAMILIA?: number | null;
  ID_GRUPO?: number | null;
  ID_SUBGRUPO?: number | null;
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
  CFOP?: string | null;
  CST?: string | null;
  EAN?: string | null;
  NCM?: number | null;
  NBM?: string | null;
  PPB?: number | null;
  TEMP?: string | null;
  FLAG_CONTROLE_FISICO?: number | null;
  CONTROLAR_ESTOQUE?: number | null;
  CONSIGNADO?: number | null;
  DESTAQUE: number;
  PROMOCAO: number;
  FLAG_WEBSITE_OFF?: number | null;
  FLAG_SERVICO: number;
  INATIVO?: number | null;
  IMPORTADO: number;
  LANCAMENTO?: number | null;
  DESCRICAO_VENDA: string | null;
  ANOTACOES: string | null;
  META_TITLE: string | null;
  META_DESCRIPTION: string | null;
  DT_UPDATE?: string | Date | null;
  DATADOCADASTRO?: string | Date | null;
}

/**
 * Taxonomia relacionada retornada junto aos detalhes do produto web
 */
export interface ProductWebRelatedTaxonomy {
  ID_TAXONOMY?: number;
  PARENT_ID?: number;
  TAXONOMIA?: string | null;
  SLUG?: string | null;
  ORDEM?: number;
  LEVEL?: number | null;
}

export interface ProductWebRelatedItem {
  ID_TAXONOMY?: number;
  SKU?: number | null;
  PRODUTO?: string | null;
  DESCRICAO_TAB?: string | null;
  ETIQUETA?: string | null;
  REF?: string | null;
  MODELO?: string | null;
  PATH_IMAGEM?: string | null;
  SLUG?: string | null;
  ESTOQUE_LOJA?: number | null;
  VL_ATACADO?: string | null;
  VL_CORPORATIVO?: string | null;
  VL_VAREJO?: string | null;
  IMPORTADO?: number | null;
  PROMOCAO?: number | null;
  LANCAMENTO?: number | null;
  DATADOCADASTRO?: string | Date | null;
}

/**
 * Item retornado pela listagem product-web-find
 */
export interface ProductWebListItem {
  ID_PRODUTO: number;
  SKU: number;
  PRODUTO: string;
  DESCRICAO_TAB: string | null;
  ETIQUETA: string | null;
  REF: string | null;
  MODELO: string | null;
  TIPO: string | null;
  MARCA: string | null;
  PATH_IMAGEM_MARCA: string | null;
  PATH_IMAGEM: string | null;
  SLUG: string | null;
  ESTOQUE_LOJA: number;
  OURO: string;
  PRATA: string;
  BRONZE: string;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  DECONTO?: string | null;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
  TEMPODEGARANTIA_DIA: number;
  DESCRICAO_VENDA: string | null;
  DATADOCADASTRO: string | null;
}

/**
 * Requisição para product-web-find-id
 */
export interface ProductWebFindByIdRequest extends ProductWebBaseRequest {
  pe_type_business: number;
  pe_id_produto: number;
  pe_slug_produto: string;
}

/**
 * Requisição para product-web-find
 */
export interface ProductWebFindRequest extends ProductWebBaseRequest {
  pe_id_taxonomy?: number;
  pe_slug_taxonomy?: string;
  pe_id_produto?: number;
  pe_produto?: string;
  pe_id_marca?: number;
  pe_flag_estoque?: number;
  pe_qt_registros?: number;
  pe_pagina_id?: number;
  pe_coluna_id?: number;
  pe_ordem_id?: number;
}

/**
 * Item retornado pelo endpoint product-web-sections
 */
export interface ProductWebSectionItem {
  ID_PRODUTO: number;
  SKU?: number;
  PRODUTO?: string;
  DESCRICAO_TAB?: string;
  ETIQUETA?: string;
  REF?: string;
  MODELO?: string;
  TIPO?: string;
  MARCA?: string;
  PATH_IMAGEM_MARCA?: string;
  PATH_IMAGEM?: string | null;
  SLUG?: string | null;
  ESTOQUE_LOJA?: number;
  OURO?: number;
  PRATA?: number;
  BRONZE?: number;
  VL_ATACADO?: number;
  VL_CORPORATIVO?: number;
  VL_VAREJO?: number;
  DECONTO?: number;
  TEMPODEGARANTIA_DIA?: number;
  DESCRICAO_VENDA?: string | null;
  IMPORTADO?: number;
  PROMOCAO?: number;
  LANCAMENTO?: number;
  DATADOCADASTRO?: Date;
}

/**
 * Requisição para product-web-sections
 */
export interface ProductWebSectionsRequest extends ProductWebBaseRequest {
  pe_id_taxonomy?: number;
  pe_id_marca?: number;
  pe_id_tipo?: number;
  pe_flag_promotions?: number;
  pe_flag_highlight?: number;
  pe_flag_lancamento?: number;
  pe_qt_registros?: number;
  pe_pagina_id?: number;
  pe_coluna_id?: number;
  pe_ordem_id?: number;
}

/**
 * Estrutura base compartilhada pelas respostas dos endpoints Product Web
 */
interface ProductWebBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  info1: string;
}

/**
 * Resposta do endpoint product-web-find-id
 */
export interface ProductWebFindByIdResponse extends ProductWebBaseResponse {
  data: [
    ProductWebDetail[],
    ProductWebRelatedTaxonomy[],
    ProductWebRelatedItem[],
    StoredProcedureResponse[],
    MySQLMetadata,
  ];
}

/**
 * Resposta do endpoint product-web-find
 */
export interface ProductWebFindResponse extends ProductWebBaseResponse {
  data: [ProductWebListItem[], [StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta do endpoint product-web-sections
 */
export interface ProductWebSectionsResponse extends ProductWebBaseResponse {
  data: [ProductWebSectionItem[], [StoredProcedureResponse], MySQLMetadata];
}

/**
 * Erro base para operações Product Web
 */
export class ProductWebError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "ProductWebError";
    Object.setPrototypeOf(this, ProductWebError.prototype);
  }
}

/**
 * Erro específico quando um produto web não é encontrado
 */
export class ProductWebNotFoundError extends ProductWebError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Produto web não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Produto web não encontrado";
    super(message, "PRODUCT_WEB_NOT_FOUND", 100404);
    this.name = "ProductWebNotFoundError";
    Object.setPrototypeOf(this, ProductWebNotFoundError.prototype);
  }
}

/**
 * Erro específico para falhas de validação
 */
export class ProductWebValidationError extends ProductWebError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PRODUCT_WEB_VALIDATION_ERROR", 100400);
    this.name = "ProductWebValidationError";
    Object.setPrototypeOf(this, ProductWebValidationError.prototype);
  }
}
