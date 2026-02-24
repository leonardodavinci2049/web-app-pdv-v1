// Tipos para o serviço de taxonomias

/**
 * Custom error class for taxonomy-related errors
 */
export class TaxonomyError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "TaxonomyError";
    Object.setPrototypeOf(this, TaxonomyError.prototype);
  }
}

/**
 * Error thrown when taxonomy is not found
 */
export class TaxonomyNotFoundError extends TaxonomyError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Taxonomy não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Taxonomy não encontrada";
    super(message, "TAXONOMY_NOT_FOUND", 100404);
    this.name = "TaxonomyNotFoundError";
    Object.setPrototypeOf(this, TaxonomyNotFoundError.prototype);
  }
}

/**
 * Error thrown when taxonomy validation fails
 */
export class TaxonomyValidationError extends TaxonomyError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "TAXONOMY_VALIDATION_ERROR", 100400);
    this.name = "TaxonomyValidationError";
    Object.setPrototypeOf(this, TaxonomyValidationError.prototype);
  }
}

/**
 * Base request interface with common parameters
 */
interface BaseTaxonomyRequest {
  pe_app_id: number;
  pe_system_client_id: number;
  pe_store_id: number;
  pe_organization_id: string;
  pe_member_id: string;
  pe_user_id: string;
  pe_person_id: number;
}

/**
 * Requisição para buscar taxonomias do menu
 */
export interface FindTaxonomyMenuRequest extends BaseTaxonomyRequest {
  pe_id_tipo: number;
  pe_parent_id?: number;
}

/**
 * Requisição para listar taxonomias
 */
export interface FindTaxonomyRequest extends BaseTaxonomyRequest {
  pe_id_parent?: number;
  pe_id_taxonomy?: number;
  pe_taxonomia?: string;
  pe_flag_inativo: number;
  pe_qt_registros: number;
  pe_pagina_id: number;
  pe_coluna_id: number;
  pe_ordem_id: number;
}

/**
 * Requisição para buscar taxonomy por ID ou slug
 * Pelo menos um dos campos (pe_id_taxonomy ou pe_slug_taxonomy) deve ser fornecido
 */
export interface FindTaxonomyByIdRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy?: number;
  pe_slug_taxonomy?: string;
}

/**
 * Requisição para criar nova taxonomy
 */
export interface CreateTaxonomyRequest extends BaseTaxonomyRequest {
  pe_id_tipo: number;
  pe_parent_id: number;
  pe_taxonomia: string;
  pe_slug: string;
  pe_level: number;
}

/**
 * Requisição para atualizar taxonomy existente
 */
export interface UpdateTaxonomyRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy: number;
  pe_parent_id: number;
  pe_taxonomia: string;
  pe_slug: string;
  pe_path_imagem: string;
  pe_ordem: number;
  pe_meta_title: string;
  pe_meta_description: string;
  pe_inativo: number;
  pe_info: string;
}

/**
 * Requisição para excluir taxonomy
 */
export interface DeleteTaxonomyRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy: number;
}

/**
 * Requisição para criar relacionamento entre taxonomia e produto
 */
export interface CreateTaxonomyRelRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy: number;
  pe_id_record: number;
}

/**
 * Requisição para listar produtos de uma taxonomia
 */
export interface FindTaxonomyRelProdutoRequest extends BaseTaxonomyRequest {
  pe_id_record: number; // ID do produto
}

/**
 * Requisição para deletar relacionamento entre taxonomia e produto
 */
export interface DeleteTaxonomyRelRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy: number;
  pe_id_record: number;
}

/**
 * Requisição para atualizar status de inativação de taxonomy
 */
export interface UpdateTaxonomyInactiveRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy: number;
  pe_inactive: boolean;
}

/**
 * Requisição para atualizar metadados (SEO) de taxonomy
 */
export interface UpdateTaxonomyMetadataRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy: number;
  pe_meta_title: string;
  pe_meta_description: string;
}

/**
 * Requisição para atualizar nome de taxonomy
 */
export interface UpdateTaxonomyNameRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy: number;
  pe_taxonomia: string;
}

/**
 * Requisição para atualizar ordem de taxonomy
 */
export interface UpdateTaxonomyOrdemRequest extends BaseTaxonomyRequest {
  pe_parent_id: number;
  pe_id_taxonomy: number;
  pe_ordem: number;
}

/**
 * Requisição para atualizar ID da taxonomy pai
 */
export interface UpdateTaxonomyParentIdRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy: number;
  pe_parent_id: number;
}

/**
 * Requisição para atualizar caminho da imagem de taxonomy
 */
export interface UpdateTaxonomyPathImageRequest extends BaseTaxonomyRequest {
  pe_id_taxonomy: number;
  pe_path_imagem: string;
}

/**
 * Estrutura de dados da taxonomy
 */
export interface TaxonomyData {
  ID_TAXONOMY: number;
  PARENT_ID: number;
  TAXONOMIA: string;
  PARENT_CATEGORY?: string | null;
  PATH_IMAGEM?: string | null;
  SLUG?: string | null;
  LEVEL?: number | null;
  ORDEM: number;
  ID_IMAGEM?: number | null;
  QT_RECORDS?: number | null;
  INATIVO: number;
  META_TITLE?: string | null;
  META_DESCRIPTION?: string | null;
  ANOTACOES?: string | null;
  CREATEDAT?: string;
  UPDATEDAT?: string;
  children?: TaxonomyData[]; // For hierarchical menu structure
}

/**
 * Estrutura de resposta da stored procedure
 */
export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

/**
 * Estrutura de metadados MySQL
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
interface BaseTaxonomyResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  info1: string;
}

/**
 * Resposta da busca de taxonomias do menu
 */
export interface FindTaxonomyMenuResponse extends BaseTaxonomyResponse {
  data: [TaxonomyData[], [StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da listagem de taxonomias
 */
export interface FindTaxonomyResponse extends BaseTaxonomyResponse {
  data: [TaxonomyData[], MySQLMetadata];
}

/**
 * Resposta da busca de taxonomy por ID
 */
export interface FindTaxonomyByIdResponse extends BaseTaxonomyResponse {
  data: [[TaxonomyData], [StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da criação de taxonomy
 */
export interface CreateTaxonomyResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da atualização de taxonomy
 */
export interface UpdateTaxonomyResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da exclusão de taxonomy
 */
export interface DeleteTaxonomyResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Estrutura de dados de produto relacionado
 */
export interface TaxonomyProductData {
  ID_TAXONOMY?: number;
  PARENT_ID?: number;
  TAXONOMIA?: string;
  SLUG?: string | null;
  ORDEM?: number;
  LEVEL?: number;
}

/**
 * Resposta da criação de relacionamento
 */
export interface CreateTaxonomyRelResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da listagem de produtos relacionados
 */
export interface FindTaxonomyRelProdutoResponse extends BaseTaxonomyResponse {
  data: [TaxonomyProductData[], [StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da exclusão de relacionamento
 */
export interface DeleteTaxonomyRelResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da atualização de status de inativação
 */
export interface UpdateTaxonomyInactiveResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da atualização de metadados
 */
export interface UpdateTaxonomyMetadataResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da atualização de nome
 */
export interface UpdateTaxonomyNameResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da atualização de ordem
 */
export interface UpdateTaxonomyOrdemResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da atualização de ID pai
 */
export interface UpdateTaxonomyParentIdResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}

/**
 * Resposta da atualização de caminho de imagem
 */
export interface UpdateTaxonomyPathImageResponse extends BaseTaxonomyResponse {
  data: [[StoredProcedureResponse], MySQLMetadata];
}
