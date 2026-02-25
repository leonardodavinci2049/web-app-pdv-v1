/**
 * Zod validation schemas for Product API Service
 * Based on API Reference: .github/api-reference/api-product-reference.md
 */

import { z } from "zod";

// ========================================
// QUERY ENDPOINTS SCHEMAS
// ========================================

/**
 * Schema for finding product by ID (ENDPOINT 1)
 * Based on API Reference: product-find-id.md
 */
export const FindProductByIdSchema = z.object({
  pe_type_business: z.number().int().min(1).max(2), // 1 = B2B, 2 = B2C
  pe_id_produto: z.number().int().positive(),
  pe_slug_produto: z.string().max(300).optional(), // Optional - for URL-friendly validation
});

/**
 * Schema for listing products (ENDPOINT 2)
 * Based on API Reference: product-find.md
 */
export const FindProductsSchema = z.object({
  // Filtros (opcionais)
  pe_id_taxonomy: z.number().int().min(0).optional(), // Filtrar por taxonomia/categoria (default: 0)
  pe_slug_taxonomy: z.string().max(255).optional(), // slug da categoria (default: vazio)
  pe_id_produto: z.number().int().min(0).optional(), // Filtrar por ID específico (default: 0)
  pe_produto: z.string().max(255).optional(), // Busca por nome (LIKE)(default: vazio)
  pe_flag_estoque: z.number().int().min(0).max(1).optional(), // 1 = apenas com estoque
  pe_flag_inativo: z.number().int().min(0).max(1).optional(), // 0 = ativos, 1 = inativos

  // Paginação (opcionais)
  pe_qt_registros: z.number().int().min(1).max(100).optional(), // Quantidade por página (default: 20)
  pe_pagina_id: z.number().int().min(0).optional(), // Página atual (default: 0)
  pe_coluna_id: z.number().int().optional(), // Coluna para ordenação (default: 1)
  pe_ordem_id: z.number().int().min(1).max(2).optional(), // 1 = ASC, 2 = DESC (default: 1)
});

// ========================================
// CREATE ENDPOINT SCHEMA
// ========================================

/**
 * Schema for creating a new product (ENDPOINT 6)
 * Baseado na documentação da API e nos parâmetros obrigatórios/opcionais
 */
export const CreateProductSchema = z.object({
  // Parâmetros obrigatórios
  pe_type_business: z.number().int().min(1).max(2),
  pe_nome_produto: z.string().min(1).max(255),
  pe_slug: z.string().min(1).max(255),

  // Dados básicos opcionais
  pe_descricao_tab: z.string().max(500).optional().default(""),
  pe_etiqueta: z.string().max(100).optional().default(""),
  pe_ref: z.string().max(100).optional().default(""),
  pe_modelo: z.string().max(100).optional().default(""),

  // Relacionamentos opcionais
  pe_id_fornecedor: z.number().int().min(0).optional().default(0),
  pe_id_tipo: z.number().int().min(0).optional().default(0),
  pe_id_marca: z.number().int().min(0).optional().default(0),
  pe_id_familia: z.number().int().min(0).optional().default(0),
  pe_id_grupo: z.number().int().min(0).optional().default(0),
  pe_id_subgrupo: z.number().int().min(0).optional().default(0),

  // Características físicas opcionais
  pe_peso_gr: z.number().min(0).optional().default(0),
  pe_comprimento_mm: z.number().min(0).optional().default(0),
  pe_largura_mm: z.number().min(0).optional().default(0),
  pe_altura_mm: z.number().min(0).optional().default(0),
  pe_diametro_mm: z.number().min(0).optional().default(0),
  pe_tempodegarantia_mes: z.number().int().min(0).optional().default(0),

  // Preços obrigatórios
  pe_vl_venda_atacado: z.number().min(0).optional().default(0),
  pe_vl_venda_varejo: z.number().min(0).optional().default(0),
  pe_vl_corporativo: z.number().min(0).optional().default(0),

  // Estoque e flags opcionais
  pe_qt_estoque: z.number().int().min(0).optional().default(0),
  pe_flag_website_off: z.number().int().min(0).max(1).optional().default(0),
  pe_flag_importado: z.number().int().min(0).max(2).optional().default(2),

  // Informações adicionais opcionais
  pe_info: z.string().optional().default(""),
});
// ========================================
// UPDATE ENDPOINTS SCHEMAS
// ========================================

/**
 * Schema for updating general product data (ENDPOINT 7)
 */
export const UpdateProductGeneralSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_nome_produto: z.string().min(1).max(255),
  pe_ref: z.string().max(100),
  pe_modelo: z.string().max(100),
  pe_etiqueta: z.string().max(100),
  pe_descricao_tab: z.string().max(200),
});

/**
 * Schema for updating product name (ENDPOINT 8)
 */
export const UpdateProductNameSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_nome_produto: z.string().min(1).max(255),
});

/**
 * Schema for updating product type (ENDPOINT 9)
 */
export const UpdateProductTypeSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_id_tipo: z.number().int().positive(),
});

/**
 * Schema for updating product brand (ENDPOINT 10)
 */
export const UpdateProductBrandSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_id_marca: z.number().int().positive(),
});

/**
 * Schema for updating product stock (ENDPOINT 11)
 */
export const UpdateProductStockSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_qt_estoque: z.number().int().min(0),
  pe_qt_minimo: z.number().int().min(0),
});

/**
 * Schema for updating product prices (ENDPOINT 12)
 */
export const UpdateProductPriceSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_preco_venda_atac: z.number().min(0),
  pe_preco_venda_corporativo: z.number().min(0),
  pe_preco_venda_vare: z.number().min(0),
});

/**
 * Schema for updating product flags (ENDPOINT 13)
 */
export const UpdateProductFlagsSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_flag_inativo: z.number().int().min(0).max(1),
  pe_flag_importado: z.number().int().min(0).max(1),
  pe_flag_controle_fisico: z.number().int().min(0).max(1),
  pe_flag_controle_estoque: z.number().int().min(0).max(1),
  pe_flag_destaque: z.number().int().min(0).max(1),
  pe_flag_promocao: z.number().int().min(0).max(1),
  pe_flag_descontinuado: z.number().int().min(0).max(1),
  pe_flag_servico: z.number().int().min(0).max(1),
  pe_flag_website_off: z.number().int().min(0).max(1),
});

/**
 * Schema for updating product characteristics (ENDPOINT 14)
 */
export const UpdateProductCharacteristicsSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_peso_gr: z.number().min(0),
  pe_comprimento_mm: z.number().min(0),
  pe_largura_mm: z.number().min(0),
  pe_altura_mm: z.number().min(0),
  pe_diametro_mm: z.number().min(0),
  pe_tempodegarantia_dia: z.number().int().min(0),
  pe_tempodegarantia_mes: z.number().int().min(0),
});

/**
 * Schema for updating product tax values (ENDPOINT 15)
 */
export const UpdateProductTaxValuesSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_cfop: z.string().max(100),
  pe_cst: z.string().max(100),
  pe_ean: z.string().max(100),
  pe_nbm: z.string().max(100),
  pe_ncm: z.number().int().positive(),
  pe_ppb: z.number(),
  pe_temp: z.number(),
});

/**
 * Schema for updating product short description (ENDPOINT 16)
 */
export const UpdateProductShortDescriptionSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_descricao_venda: z.string().max(1000),
});

/**
 * Schema for updating product full description (ENDPOINT 17)
 */
export const UpdateProductDescriptionSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_produto_descricao: z.string().max(10000),
});

/**
 * Schema for updating various product data (ENDPOINT 18)
 */
export const UpdateProductVariousSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_nome_produto: z.string().min(1).max(255),
});

/**
 * Schema for updating product image path (ENDPOINT 19)
 */
export const UpdateProductImagePathSchema = z.object({
  pe_id_produto: z.number().int().positive(),
  pe_path_imagem: z.string().min(1).max(255),
});

// ========================================
// INFERRED TYPES
// ========================================

export type FindProductByIdInput = z.infer<typeof FindProductByIdSchema>;
export type FindProductsInput = z.infer<typeof FindProductsSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductGeneralInput = z.infer<
  typeof UpdateProductGeneralSchema
>;
export type UpdateProductNameInput = z.infer<typeof UpdateProductNameSchema>;
export type UpdateProductTypeInput = z.infer<typeof UpdateProductTypeSchema>;
export type UpdateProductBrandInput = z.infer<typeof UpdateProductBrandSchema>;
export type UpdateProductStockInput = z.infer<typeof UpdateProductStockSchema>;
export type UpdateProductPriceInput = z.infer<typeof UpdateProductPriceSchema>;
export type UpdateProductFlagsInput = z.infer<typeof UpdateProductFlagsSchema>;
export type UpdateProductCharacteristicsInput = z.infer<
  typeof UpdateProductCharacteristicsSchema
>;
export type UpdateProductTaxValuesInput = z.infer<
  typeof UpdateProductTaxValuesSchema
>;
export type UpdateProductShortDescriptionInput = z.infer<
  typeof UpdateProductShortDescriptionSchema
>;
export type UpdateProductDescriptionInput = z.infer<
  typeof UpdateProductDescriptionSchema
>;
export type UpdateProductVariousInput = z.infer<
  typeof UpdateProductVariousSchema
>;
export type UpdateProductImagePathInput = z.infer<
  typeof UpdateProductImagePathSchema
>;

/**
 * Schema for updating product metadata (ENDPOINT 20)
 */
export const UpdateProductMetadataSchema = z.object({
  pe_id_produto: z.number().int().min(1),
  pe_meta_title: z.string().max(100),
  pe_meta_description: z.string().max(200),
});

export type UpdateProductMetadataInput = z.infer<
  typeof UpdateProductMetadataSchema
>;
