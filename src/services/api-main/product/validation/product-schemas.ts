/**
 * Schemas de validação para o serviço Product Web
 */

import { z } from "zod";

/**
 * Schema para buscar produto web por ID/slug
 */
export const ProductWebFindByIdSchema = z.object({
  pe_type_business: z.number().int().positive(),
  pe_id_produto: z.number().int().positive(),
  pe_slug_produto: z.string().max(300).min(1),
});

/**
 * Schema para listar produtos web com filtros
 */
export const ProductWebFindSchema = z.object({
  pe_id_taxonomy: z.number().int().min(0).optional(),
  pe_slug_taxonomy: z.string().max(300).optional(),
  pe_id_produto: z.number().int().min(0).optional(),
  pe_produto: z.string().max(300).optional(),
  pe_id_marca: z.number().int().min(0).optional(),
  pe_flag_estoque: z.number().int().min(0).max(1).optional(),
  pe_qt_registros: z.number().int().min(1).max(1000).optional(),
  pe_pagina_id: z.number().int().min(0).optional(),
  pe_coluna_id: z.number().int().min(1).optional(),
  pe_ordem_id: z.number().int().min(1).max(2).optional(),
});

/**
 * Schema para consultar seções web de produtos
 */
export const ProductWebSectionsSchema = z.object({
  pe_id_taxonomy: z.number().int().min(0).optional(),
  pe_id_marca: z.number().int().min(0).optional(),
  pe_id_tipo: z.number().int().min(0).optional(),
  pe_flag_promotions: z.number().int().min(0).max(1).optional(),
  pe_flag_highlight: z.number().int().min(0).max(1).optional(),
  pe_flag_lancamento: z.number().int().min(0).max(1).optional(),
  pe_qt_registros: z.number().int().min(1).max(1000).optional(),
  pe_pagina_id: z.number().int().min(0).optional(),
  pe_coluna_id: z.number().int().min(1).optional(),
  pe_ordem_id: z.number().int().min(1).optional(),
});

export type ProductWebFindByIdInput = z.infer<typeof ProductWebFindByIdSchema>;
export type ProductWebFindInput = z.infer<typeof ProductWebFindSchema>;
export type ProductWebSectionsInput = z.infer<typeof ProductWebSectionsSchema>;
