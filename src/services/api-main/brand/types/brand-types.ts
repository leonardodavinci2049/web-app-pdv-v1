/**
 * Tipos e interfaces utilizados pelo BrandServiceApi
 */

/**
 * Estrutura base para requisições que exigem contexto de tenant
 * Apenas parâmetros fixos são definidos na base
 */
interface BrandBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_member_role?: string;
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
 * Estrutura de dados da marca básica
 */
export interface BrandData {
  ID_MARCA: number;
  MARCA: string | null;
}

/**
 * Estrutura de dados detalhada da marca (retornada por find-id)
 */
export interface BrandDetail {
  ID_MARCA: number;
  UUID: string | null;
  ID_SYSTEM_CLIENTE: number;
  NOME: string | null;
  MARCA: string | null;
  INATIVO: number;
  DT_UPDATE: string | Date | null;
  DATADOCADASTRO: string | Date | null;
}

/**
 * Requisição para cadastrar marca
 */
export interface CreateBrandRequest extends BrandBaseRequest {
  pe_brand: string;
  pe_slug: string;
}

/**
 * Requisição para listar marcas
 */
export interface FindAllBrandRequest extends BrandBaseRequest {
  pe_brand_id?: number;
  pe_brand?: string;
  pe_limit?: number;
}

/**
 * Requisição para buscar marca por ID
 */
export interface FindByIdBrandRequest extends BrandBaseRequest {
  pe_brand_id: number;
}

/**
 * Requisição para atualizar marca
 */
export interface UpdateBrandRequest extends BrandBaseRequest {
  pe_brand_id: number;
  pe_brand?: string;
  pe_slug?: string;
  pe_image_path?: string;
  pe_notes?: string;
  pe_inactive?: number;
}

/**
 * Requisição para excluir marca
 */
export interface DeleteBrandRequest extends BrandBaseRequest {
  pe_brand_id: number;
}

/**
 * Estrutura base compartilhada pelas respostas dos endpoints Brand
 */
interface BrandBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  info1: string;
}

/**
 * Resposta do endpoint brand-find-all
 * Formato: data: { "Brand find All": [...] }
 */
export interface FindAllBrandResponse extends BrandBaseResponse {
  data: { "Brand find All": BrandData[] };
}

/**
 * Resposta do endpoint brand-find-id
 * Formato: data: { "Brand find All": [...] }
 */
export interface FindByIdBrandResponse extends BrandBaseResponse {
  data: { "Brand find All": BrandDetail[] };
}

/**
 * Resposta do endpoint brand-create
 * Formato: data: [ { sp_return_id, sp_message, sp_error_id } ]
 */
export interface CreateBrandResponse extends BrandBaseResponse {
  data: [StoredProcedureResponse];
}

/**
 * Resposta do endpoint brand-update
 * Formato: data: [ { sp_return_id, sp_message, sp_error_id } ]
 */
export interface UpdateBrandResponse extends BrandBaseResponse {
  data: [StoredProcedureResponse];
}

/**
 * Resposta do endpoint brand-delete
 * Formato: data: [ { sp_return_id, sp_message, sp_error_id } ]
 */
export interface DeleteBrandResponse extends BrandBaseResponse {
  data: [StoredProcedureResponse];
}

/**
 * Erro base para operações Brand
 */
export class BrandError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "BrandError";
    Object.setPrototypeOf(this, BrandError.prototype);
  }
}

/**
 * Erro específico quando uma marca não é encontrada
 */
export class BrandNotFoundError extends BrandError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Marca não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Marca não encontrada";
    super(message, "BRAND_NOT_FOUND", 100404);
    this.name = "BrandNotFoundError";
    Object.setPrototypeOf(this, BrandNotFoundError.prototype);
  }
}

/**
 * Erro específico para falhas de validação
 */
export class BrandValidationError extends BrandError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "BRAND_VALIDATION_ERROR", 100400);
    this.name = "BrandValidationError";
    Object.setPrototypeOf(this, BrandValidationError.prototype);
  }
}
