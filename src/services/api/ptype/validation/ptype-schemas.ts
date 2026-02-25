/**
 * Schemas de validação Zod para o serviço de tipos de produto
 */

import { z } from "zod";

/**
 * Schema para listar tipos de produto com filtros
 */
export const FindPtypeSchema = z.object({
  pe_id_tipo: z.number().int().min(0).optional(),
  pe_tipo: z.string().max(255).optional(),
  pe_limit: z.number().int().min(1).max(500).optional(),
});

/**
 * Tipos inferidos dos schemas
 */
export type FindPtypeInput = z.infer<typeof FindPtypeSchema>;
