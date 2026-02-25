/**
 * Schemas de validação Zod para o serviço de verificação (Check API)
 */

import { z } from "zod";

/**
 * Schema base para parâmetros de identificação (obrigatórios em todas as requisições)
 */
const BaseIdentificationSchema = z.object({
  pe_app_id: z.number().int().positive(),
  pe_system_client_id: z.number().int().positive(),
  pe_store_id: z.number().int().positive(),
  pe_organization_id: z.string().max(200),
  pe_member_id: z.string().max(200),
  pe_user_id: z.string().max(200),
  pe_person_id: z.number().int().positive().optional(),
});

/**
 * Schema base para termo de busca (mínimo 3 caracteres)
 */
const BaseTermSchema = z.object({
  pe_term: z
    .string()
    .min(3, "TERMO must have at least 3 characters")
    .max(500, "TERMO cannot exceed 500 characters"),
});

/**
 * Schema base combinando identificação e termo
 */
const BaseCheckSchema = BaseIdentificationSchema.merge(BaseTermSchema);

// ===========================================
// SPECIFIC VALIDATION SCHEMAS
// ===========================================

/**
 * Schema para verificar email
 */
export const CheckEmailSchema = BaseCheckSchema.extend({
  pe_term: z
    .string()
    .min(3, "Email must have at least 3 characters")
    .max(255, "Email cannot exceed 255 characters")
    .email("Email must have a valid format")
    .transform((email) => email.trim().toLowerCase()),
});

/**
 * Schema para verificar CPF
 */
export const CheckCpfSchema = BaseCheckSchema.extend({
  pe_term: z
    .string()
    .min(11, "CPF must have at least 11 digits")
    .max(14, "CPF cannot exceed 14 characters")
    .transform((cpf) => cpf.replace(/[^\d]/g, "")) // Remove non-numeric characters
    .refine((cpf) => cpf.length === 11, {
      message: "CPF must contain exactly 11 digits",
    })
    .refine((cpf) => /^\d{11}$/.test(cpf), {
      message: "CPF must contain only numeric digits",
    }),
});

/**
 * Schema para verificar CNPJ
 */
export const CheckCnpjSchema = BaseCheckSchema.extend({
  pe_term: z
    .string()
    .min(14, "CNPJ must have at least 14 digits")
    .max(18, "CNPJ cannot exceed 18 characters")
    .transform((cnpj) => cnpj.replace(/[^\d]/g, "")) // Remove non-numeric characters
    .refine((cnpj) => cnpj.length === 14, {
      message: "CNPJ must contain exactly 14 digits",
    })
    .refine((cnpj) => /^\d{14}$/.test(cnpj), {
      message: "CNPJ must contain only numeric digits",
    }),
});

/**
 * Schema para verificar slug de taxonomia
 */
export const CheckTaxonomySlugSchema = BaseCheckSchema.extend({
  pe_term: z
    .string()
    .min(3, "Taxonomy slug must have at least 3 characters")
    .max(255, "Taxonomy slug cannot exceed 255 characters")
    .transform((slug) => slug.trim().toLowerCase())
    .refine((slug) => /^[a-z0-9-]+$/.test(slug), {
      message:
        "Taxonomy slug must contain only lowercase letters, numbers, and hyphens",
    }),
});

/**
 * Schema para verificar nome de produto
 */
export const CheckProductNameSchema = BaseCheckSchema.extend({
  pe_term: z
    .string()
    .min(3, "Product name must have at least 3 characters")
    .max(255, "Product name cannot exceed 255 characters")
    .transform((name) => name.trim()),
});

/**
 * Schema para verificar slug de produto
 */
export const CheckProductSlugSchema = BaseCheckSchema.extend({
  pe_term: z
    .string()
    .min(3, "Product slug must have at least 3 characters")
    .max(255, "Product slug cannot exceed 255 characters")
    .transform((slug) => slug.trim().toLowerCase())
    .refine((slug) => /^[a-z0-9-]+$/.test(slug), {
      message:
        "Product slug must contain only lowercase letters, numbers, and hyphens",
    }),
});

// ===========================================
// PARTIAL SCHEMAS (for optional parameters)
// ===========================================

/**
 * Schema parcial para verificar email (para uso em formulários)
 */
export const CheckEmailPartialSchema = CheckEmailSchema.partial().extend({
  pe_term: CheckEmailSchema.shape.pe_term,
});

/**
 * Schema parcial para verificar CPF
 */
export const CheckCpfPartialSchema = CheckCpfSchema.partial().extend({
  pe_term: CheckCpfSchema.shape.pe_term,
});

/**
 * Schema parcial para verificar CNPJ
 */
export const CheckCnpjPartialSchema = CheckCnpjSchema.partial().extend({
  pe_term: CheckCnpjSchema.shape.pe_term,
});

/**
 * Schema parcial para verificar slug de taxonomia
 */
export const CheckTaxonomySlugPartialSchema =
  CheckTaxonomySlugSchema.partial().extend({
    pe_term: CheckTaxonomySlugSchema.shape.pe_term,
  });

/**
 * Schema parcial para verificar nome de produto
 */
export const CheckProductNamePartialSchema =
  CheckProductNameSchema.partial().extend({
    pe_term: CheckProductNameSchema.shape.pe_term,
  });

/**
 * Schema parcial para verificar slug de produto
 */
export const CheckProductSlugPartialSchema =
  CheckProductSlugSchema.partial().extend({
    pe_term: CheckProductSlugSchema.shape.pe_term,
  });

// ===========================================
// RESPONSE VALIDATION SCHEMAS
// ===========================================

/**
 * Schema para validar dados de resposta da verificação
 */
export const CheckRecordsSchema = z.object({
  ID_CHECK: z.number().int().min(0).max(1).optional(),
  ID_RECORD: z.number().int().min(0),
});

/**
 * Schema para validar resposta base da verificação
 */
export const BaseCheckResponseSchema = z.object({
  statusCode: z.number().int(),
  message: z.string(),
  recordId: z.number().int().min(0),
  data: CheckRecordsSchema,
  quantity: z.number().int().min(0),
  info1: z.string().optional(),
});

/**
 * Schema para validar resposta do status da API
 */
export const ApiStatusResponseSchema = z.object({
  name: z.string(),
  status: z.string(),
  version: z.string(),
  documentation: z.string(),
  timestamp: z.string().datetime(),
  endpoints: z.object({
    base: z.string(),
    auth: z.string(),
  }),
});

// ===========================================
// UTILITY VALIDATION FUNCTIONS
// ===========================================

/**
 * Valida se um email tem formato válido (básico)
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida se um CPF tem formato válido (apenas formato, não validação de dígitos)
 */
export function isValidCpfFormat(cpf: string): boolean {
  const cleanCpf = cpf.replace(/[^\d]/g, "");
  return cleanCpf.length === 11 && /^\d{11}$/.test(cleanCpf);
}

/**
 * Valida se um CNPJ tem formato válido (apenas formato, não validação de dígitos)
 */
export function isValidCnpjFormat(cnpj: string): boolean {
  const cleanCnpj = cnpj.replace(/[^\d]/g, "");
  return cleanCnpj.length === 14 && /^\d{14}$/.test(cleanCnpj);
}

/**
 * Valida se um slug tem formato válido
 */
export function isValidSlugFormat(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug.trim().toLowerCase());
}

/**
 * Valida se um termo tem o comprimento mínimo necessário
 */
export function isValidMinLength(term: string, minLength = 3): boolean {
  return term.trim().length >= minLength;
}

// ===========================================
// INFERRED TYPES
// ===========================================

/**
 * Tipos inferidos dos schemas de validação
 */
export type CheckEmailInput = z.infer<typeof CheckEmailSchema>;
export type CheckCpfInput = z.infer<typeof CheckCpfSchema>;
export type CheckCnpjInput = z.infer<typeof CheckCnpjSchema>;
export type CheckTaxonomySlugInput = z.infer<typeof CheckTaxonomySlugSchema>;
export type CheckProductNameInput = z.infer<typeof CheckProductNameSchema>;
export type CheckProductSlugInput = z.infer<typeof CheckProductSlugSchema>;

/**
 * Tipos parciais para formulários
 */
export type CheckEmailPartialInput = z.infer<typeof CheckEmailPartialSchema>;
export type CheckCpfPartialInput = z.infer<typeof CheckCpfPartialSchema>;
export type CheckCnpjPartialInput = z.infer<typeof CheckCnpjPartialSchema>;
export type CheckTaxonomySlugPartialInput = z.infer<
  typeof CheckTaxonomySlugPartialSchema
>;
export type CheckProductNamePartialInput = z.infer<
  typeof CheckProductNamePartialSchema
>;
export type CheckProductSlugPartialInput = z.infer<
  typeof CheckProductSlugPartialSchema
>;

/**
 * Tipos de resposta validados
 */
export type CheckRecordsValidated = z.infer<typeof CheckRecordsSchema>;
export type BaseCheckResponseValidated = z.infer<
  typeof BaseCheckResponseSchema
>;
export type ApiStatusResponseValidated = z.infer<
  typeof ApiStatusResponseSchema
>;
