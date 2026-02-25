/**
 * Schemas de validação Zod para o serviço de taxonomia
 */

import { z } from "zod";

/**
 * Schema para buscar taxonomias do menu
 */
export const FindTaxonomyMenuSchema = z.object({
  pe_id_tipo: z.number().int().positive(),
  pe_parent_id: z.number().int().min(0).optional(),
});

/**
 * Schema para listar taxonomias com filtros e paginação
 */
export const FindTaxonomySchema = z.object({
  pe_id_parent: z.number().int().optional(),
  pe_id_taxonomy: z.number().int().min(0).optional(),
  pe_taxonomia: z.string().max(255).optional(),
  pe_flag_inativo: z.number().int().min(0).max(1).optional(),
  pe_qt_registros: z.number().int().min(1).max(100).optional(),
  pe_pagina_id: z.number().int().min(0).optional(),
  pe_coluna_id: z.number().int().optional(),
  pe_ordem_id: z.number().int().min(1).max(2).optional(), // 1 = ASC, 2 = DESC
});

/**
 * Schema para buscar taxonomy por ID ou slug
 * Pelo menos um dos campos deve ser fornecido
 */
export const FindTaxonomyByIdSchema = z
  .object({
    pe_id_taxonomy: z.number().int().positive().optional(),
    pe_slug_taxonomy: z.string().min(1).max(255).optional(),
  })
  .refine(
    (data) =>
      data.pe_id_taxonomy !== undefined || data.pe_slug_taxonomy !== undefined,
    {
      message: "Either 'pe_id_taxonomy' or 'pe_slug_taxonomy' must be provided",
    },
  );

/**
 * Schema para criar nova taxonomy
 */
export const CreateTaxonomySchema = z.object({
  pe_id_tipo: z.number().int().positive(),
  pe_parent_id: z.number().int().min(0),
  pe_taxonomia: z.string().min(1).max(255),
  pe_slug: z.string().min(1).max(255),
  pe_level: z.number().int().min(1),
});

/**
 * Schema para atualizar taxonomy existente
 */
export const UpdateTaxonomySchema = z.object({
  pe_id_taxonomy: z.number().int().positive(),
  pe_parent_id: z.number().int().min(0).optional(),
  pe_taxonomia: z.string().min(1).max(255),
  pe_slug: z.string().max(255).optional(),
  pe_path_imagem: z.string().max(500).optional(),
  pe_ordem: z.number().int().min(1).optional(),
  pe_meta_title: z.string().max(255).optional(),
  pe_meta_description: z.string().max(500).optional(),
  pe_inativo: z.number().int().min(0).max(1).optional(),
  pe_info: z.string().optional(),
});

/**
 * Schema para excluir taxonomy
 */
export const DeleteTaxonomySchema = z.object({
  pe_id_taxonomy: z.number().int().positive(),
});

/**
 * Schema para criar relacionamento entre taxonomia e produto
 */
export const CreateTaxonomyRelSchema = z.object({
  pe_id_taxonomy: z.number().int().positive(),
  pe_id_record: z.number().int().positive(),
});

/**
 * Schema para listar produtos de uma taxonomia
 */
export const FindTaxonomyRelProdutoSchema = z.object({
  pe_id_record: z.number().int().positive(), // ID do produto
});

/**
 * Schema para deletar relacionamento entre taxonomia e produto
 */
export const DeleteTaxonomyRelSchema = z.object({
  pe_id_taxonomy: z.number().int().positive(),
  pe_id_record: z.number().int().positive(),
});

/**
 * Schema para atualizar status de inativação de taxonomy
 */
export const UpdateTaxonomyInactiveSchema = z.object({
  pe_id_taxonomy: z.number().int().positive(),
  pe_inactive: z.boolean(),
});

/**
 * Schema para atualizar metadados (SEO) de taxonomy
 */
export const UpdateTaxonomyMetadataSchema = z.object({
  pe_id_taxonomy: z.number().int().positive(),
  pe_meta_title: z.string().min(1).max(100),
  pe_meta_description: z.string().min(1).max(255),
});

/**
 * Schema para atualizar nome de taxonomy
 */
export const UpdateTaxonomyNameSchema = z.object({
  pe_id_taxonomy: z.number().int().positive(),
  pe_taxonomia: z.string().min(1).max(200),
});

/**
 * Schema para atualizar ordem de taxonomy
 */
export const UpdateTaxonomyOrdemSchema = z.object({
  pe_parent_id: z.number().int().min(0),
  pe_id_taxonomy: z.number().int().positive(),
  pe_ordem: z.number().int().positive(),
});

/**
 * Schema para atualizar ID da taxonomy pai
 */
export const UpdateTaxonomyParentIdSchema = z.object({
  pe_id_taxonomy: z.number().int().positive(),
  pe_parent_id: z.number().int().min(0),
});

/**
 * Schema para atualizar caminho da imagem de taxonomy
 */
export const UpdateTaxonomyPathImageSchema = z.object({
  pe_id_taxonomy: z.number().int().positive(),
  pe_path_imagem: z.string().min(1).max(200),
});

/**
 * Tipos inferidos dos schemas
 */
export type FindTaxonomyMenuInput = z.infer<typeof FindTaxonomyMenuSchema>;
export type FindTaxonomyInput = z.infer<typeof FindTaxonomySchema>;
export type FindTaxonomyByIdInput = z.infer<typeof FindTaxonomyByIdSchema>;
export type CreateTaxonomyInput = z.infer<typeof CreateTaxonomySchema>;
export type UpdateTaxonomyInput = z.infer<typeof UpdateTaxonomySchema>;
export type DeleteTaxonomyInput = z.infer<typeof DeleteTaxonomySchema>;
export type CreateTaxonomyRelInput = z.infer<typeof CreateTaxonomyRelSchema>;
export type FindTaxonomyRelProdutoInput = z.infer<
  typeof FindTaxonomyRelProdutoSchema
>;
export type DeleteTaxonomyRelInput = z.infer<typeof DeleteTaxonomyRelSchema>;
export type UpdateTaxonomyInactiveInput = z.infer<
  typeof UpdateTaxonomyInactiveSchema
>;
export type UpdateTaxonomyMetadataInput = z.infer<
  typeof UpdateTaxonomyMetadataSchema
>;
export type UpdateTaxonomyNameInput = z.infer<typeof UpdateTaxonomyNameSchema>;
export type UpdateTaxonomyOrdemInput = z.infer<
  typeof UpdateTaxonomyOrdemSchema
>;
export type UpdateTaxonomyParentIdInput = z.infer<
  typeof UpdateTaxonomyParentIdSchema
>;
export type UpdateTaxonomyPathImageInput = z.infer<
  typeof UpdateTaxonomyPathImageSchema
>;
