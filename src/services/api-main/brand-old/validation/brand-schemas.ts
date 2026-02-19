/**
 * Schemas de validação para o serviço Brand
 */

import { z } from "zod";

/**
 * Schema para cadastrar marca
 */
export const CreateBrandSchema = z.object({
  pe_brand: z.string().min(1).max(100),
  pe_slug: z.string().min(1).max(300),
});

/**
 * Schema para listar marcas com filtros
 */
export const FindAllBrandSchema = z.object({
  pe_brand_id: z.number().int().min(0).optional(),
  pe_brand: z.string().max(200).optional(),
  pe_limit: z.number().int().min(1).max(500).optional(),
});

/**
 * Schema para buscar marca por ID
 */
export const FindByIdBrandSchema = z.object({
  pe_brand_id: z.number().int().positive(),
});

/**
 * Schema para atualizar marca
 */
export const UpdateBrandSchema = z.object({
  pe_brand_id: z.number().int().positive(),
  pe_brand: z.string().max(100).optional(),
  pe_slug: z.string().max(100).optional(),
  pe_image_path: z.string().max(500).optional(),
  pe_notes: z.string().optional(),
  pe_inactive: z.number().int().min(0).max(1).optional(),
});

/**
 * Schema para excluir marca
 */
export const DeleteBrandSchema = z.object({
  pe_brand_id: z.number().int().positive(),
});

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
export type FindAllBrandInput = z.infer<typeof FindAllBrandSchema>;
export type FindByIdBrandInput = z.infer<typeof FindByIdBrandSchema>;
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>;
export type DeleteBrandInput = z.infer<typeof DeleteBrandSchema>;
