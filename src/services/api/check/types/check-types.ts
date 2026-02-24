/**
 * Tipos para o serviço de verificação (Check API)
 * Baseado na documentação da API Check Reference
 */

/**
 * Custom error class for check-related errors
 */
export class CheckError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "CheckError";
    Object.setPrototypeOf(this, CheckError.prototype);
  }
}

/**
 * Error thrown when validation check fails
 */
export class CheckValidationError extends CheckError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "CHECK_VALIDATION_ERROR", 100400);
    this.name = "CheckValidationError";
    Object.setPrototypeOf(this, CheckValidationError.prototype);
  }
}

/**
 * Base request interface with common parameters
 */
interface BaseCheckRequest {
  pe_app_id: number;
  pe_system_client_id: number;
  pe_store_id: number;
  pe_organization_id: string;
  pe_member_id: string;
  pe_user_id: string;
  pe_person_id?: number;
}

/**
 * Base check request with term parameter
 */
interface BaseCheckTermRequest extends BaseCheckRequest {
  pe_term: string; // Minimum 3 characters
}

/**
 * Estrutura de dados retornada pelos endpoints de check
 */
export interface CheckRecordsType {
  ID_CHECK?: number; // 1 = exists, 0 = does not exist
  ID_RECORD: number; // ID of found record (or 0)
}

/**
 * Estrutura padrão de resposta dos endpoints de check
 */
export interface BaseCheckResponse {
  statusCode: number;
  message: string;
  recordId: number; // ID of found record (or 0)
  data: CheckRecordsType;
  quantity: number; // 0 = does not exist, 1+ = exists
  info1?: string;
}

/**
 * Estrutura de resposta do status da API (health check)
 */
export interface ApiStatusResponse {
  name: string;
  status: string;
  version: string;
  documentation: string;
  timestamp: string;
  endpoints: {
    base: string;
    auth: string;
  };
}

// ===========================================
// REQUEST TYPES
// ===========================================

/**
 * Request para verificar se email existe
 */
export interface CheckEmailRequest extends BaseCheckTermRequest {}

/**
 * Request para verificar se CPF existe
 */
export interface CheckCpfRequest extends BaseCheckTermRequest {}

/**
 * Request para verificar se CNPJ existe
 */
export interface CheckCnpjRequest extends BaseCheckTermRequest {}

/**
 * Request para verificar se slug de taxonomia existe
 */
export interface CheckTaxonomySlugRequest extends BaseCheckTermRequest {}

/**
 * Request para verificar se nome de produto existe
 */
export interface CheckProductNameRequest extends BaseCheckTermRequest {}

/**
 * Request para verificar se slug de produto existe
 */
export interface CheckProductSlugRequest extends BaseCheckTermRequest {}

// ===========================================
// RESPONSE TYPES
// ===========================================

/**
 * Response para verificação de email
 */
export interface CheckEmailResponse extends BaseCheckResponse {}

/**
 * Response para verificação de CPF
 */
export interface CheckCpfResponse extends BaseCheckResponse {}

/**
 * Response para verificação de CNPJ
 */
export interface CheckCnpjResponse extends BaseCheckResponse {}

/**
 * Response para verificação de slug de taxonomia
 */
export interface CheckTaxonomySlugResponse extends BaseCheckResponse {}

/**
 * Response para verificação de nome de produto
 */
export interface CheckProductNameResponse extends BaseCheckResponse {}

/**
 * Response para verificação de slug de produto
 */
export interface CheckProductSlugResponse extends BaseCheckResponse {}

// ===========================================
// UTILITY TYPES
// ===========================================

/**
 * Resultado processado de uma verificação
 */
export interface CheckResult {
  isAvailable: boolean; // true = available for use, false = already exists
  recordId: number; // ID of existing record (0 if available)
  message: string; // Descriptive message
  existingData?: CheckRecordsType; // Additional data if record exists
}

/**
 * Tipos de verificação disponíveis
 */
export enum CheckType {
  EMAIL = "email",
  CPF = "cpf",
  CNPJ = "cnpj",
  TAXONOMY_SLUG = "taxonomy-slug",
  PRODUCT_NAME = "product-name",
  PRODUCT_SLUG = "product-slug",
}

/**
 * Configuração para diferentes tipos de verificação
 */
export interface CheckTypeConfig {
  endpoint: string;
  minLength: number;
  normalizeInput?: (input: string) => string;
  validationPattern?: RegExp;
  errorMessage?: string;
}

/**
 * Mapeamento de configurações por tipo de verificação
 */
export type CheckTypeConfigMap = {
  [K in CheckType]: CheckTypeConfig;
};

// ===========================================
// VALIDATION HELPERS
// ===========================================

/**
 * Função para normalizar CPF (remove caracteres não numéricos)
 */
export function normalizeCpf(cpf: string): string {
  return cpf.replace(/[^\d]/g, "");
}

/**
 * Função para normalizar CNPJ (remove caracteres não numéricos)
 */
export function normalizeCnpj(cnpj: string): string {
  return cnpj.replace(/[^\d]/g, "");
}

/**
 * Função para normalizar email (trim + lowercase)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Função para normalizar slug (trim + lowercase)
 */
export function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

/**
 * Função para normalizar nome de produto (trim)
 */
export function normalizeProductName(name: string): string {
  return name.trim();
}

// ===========================================
// CONSTANTS
// ===========================================

/**
 * Configurações padrão para cada tipo de verificação
 */
export const CHECK_TYPE_CONFIGS: CheckTypeConfigMap = {
  [CheckType.EMAIL]: {
    endpoint: "/check/v2/check-if-email-exists",
    minLength: 3,
    normalizeInput: normalizeEmail,
    validationPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "Email deve ter um formato válido",
  },
  [CheckType.CPF]: {
    endpoint: "/check/v2/check-if-cpf-exists",
    minLength: 11,
    normalizeInput: normalizeCpf,
    validationPattern: /^\d{11}$/,
    errorMessage: "CPF deve conter 11 dígitos numéricos",
  },
  [CheckType.CNPJ]: {
    endpoint: "/check/v2/check-if-cnpj-exists",
    minLength: 14,
    normalizeInput: normalizeCnpj,
    validationPattern: /^\d{14}$/,
    errorMessage: "CNPJ deve conter 14 dígitos numéricos",
  },
  [CheckType.TAXONOMY_SLUG]: {
    endpoint: "/check/v2/check-if-taxonomy-slug-exists",
    minLength: 3,
    normalizeInput: normalizeSlug,
    validationPattern: /^[a-z0-9-]+$/,
    errorMessage: "Slug deve conter apenas letras minúsculas, números e hífens",
  },
  [CheckType.PRODUCT_NAME]: {
    endpoint: "/check/v2/check-if-product-name-exists",
    minLength: 3,
    normalizeInput: normalizeProductName,
    errorMessage: "Nome do produto deve ter pelo menos 3 caracteres",
  },
  [CheckType.PRODUCT_SLUG]: {
    endpoint: "/check/v2/check-if-product-slug-exists",
    minLength: 3,
    normalizeInput: normalizeSlug,
    validationPattern: /^[a-z0-9-]+$/,
    errorMessage: "Slug deve conter apenas letras minúsculas, números e hífens",
  },
};

/**
 * Mensagens de sucesso padrão
 */
export const CHECK_SUCCESS_MESSAGES: Record<CheckType, string> = {
  [CheckType.EMAIL]: "E-mail disponível para cadastro",
  [CheckType.CPF]: "CPF disponível para cadastro",
  [CheckType.CNPJ]: "CNPJ disponível para cadastro",
  [CheckType.TAXONOMY_SLUG]: "Slug disponível para cadastro",
  [CheckType.PRODUCT_NAME]: "Nome do produto disponível para cadastro",
  [CheckType.PRODUCT_SLUG]: "Slug do produto disponível para cadastro",
};

/**
 * Mensagens de erro padrão (quando já existe)
 */
export const CHECK_ERROR_MESSAGES: Record<CheckType, string> = {
  [CheckType.EMAIL]: "E-mail já cadastrado na base de dados",
  [CheckType.CPF]: "CPF já cadastrado na base de dados",
  [CheckType.CNPJ]: "CNPJ já cadastrado na base de dados",
  [CheckType.TAXONOMY_SLUG]: "Slug já cadastrado na base de dados",
  [CheckType.PRODUCT_NAME]: "Nome do produto já cadastrado na base de dados",
  [CheckType.PRODUCT_SLUG]: "Slug do produto já cadastrado na base de dados",
};
