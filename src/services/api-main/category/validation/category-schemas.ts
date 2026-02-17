/**
 * Schemas de validação para o serviço Category
 */

import { z } from "zod";

/**
 * Schema para buscar menu hierárquico de taxonomias
 */
export const TaxonomyWebMenuSchema = z.object({
  pe_id_tipo: z
    .number()
    .int()
    .min(0, { message: "pe_id_tipo deve ser um número não-negativo" }),
  pe_parent_id: z
    .number()
    .int()
    .min(0, { message: "pe_parent_id deve ser um número não-negativo" })
    .optional(),
});

export type TaxonomyWebMenuInput = z.infer<typeof TaxonomyWebMenuSchema>;
