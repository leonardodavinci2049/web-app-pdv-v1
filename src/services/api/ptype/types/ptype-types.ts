// Tipos para o serviço de tipos de produto (Product Type)

/**
 * Custom error class for ptype-related errors
 */
export class PtypeError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "PtypeError";
    Object.setPrototypeOf(this, PtypeError.prototype);
  }
}

/**
 * Error thrown when ptype is not found
 */
export class PtypeNotFoundError extends PtypeError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Tipo de produto não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Tipo de produto não encontrado";
    super(message, "PTYPE_NOT_FOUND", 100404);
    this.name = "PtypeNotFoundError";
    Object.setPrototypeOf(this, PtypeNotFoundError.prototype);
  }
}

/**
 * Error thrown when ptype validation fails
 */
export class PtypeValidationError extends PtypeError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PTYPE_VALIDATION_ERROR", 100400);
    this.name = "PtypeValidationError";
    Object.setPrototypeOf(this, PtypeValidationError.prototype);
  }
}

/**
 * Base request interface with common parameters
 */
interface BasePtypeRequest {
  pe_app_id: number;
  pe_system_client_id: number;
  pe_store_id: number;
  pe_organization_id: string;
  pe_member_id: string;
  pe_user_id: string;
  pe_person_id: number;
}

/**
 * Requisição para listar tipos de produto
 */
export interface FindPtypeRequest extends BasePtypeRequest {
  pe_id_tipo?: number;
  pe_tipo?: string;
  pe_limit?: number;
}

/**
 * Estrutura de dados do tipo de produto
 */
export interface PtypeData {
  ID_TIPO: number;
  TIPO: string;
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
interface BasePtypeResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  info1: string;
}

/**
 * Resposta da listagem de tipos de produto
 */
export interface FindPtypeResponse extends BasePtypeResponse {
  data: [PtypeData[], [StoredProcedureResponse], MySQLMetadata];
}
