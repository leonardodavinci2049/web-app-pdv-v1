import { z } from "zod";

const inlineFieldTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const UpdateProductBrandInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_brand_id: z.number().int().positive(),
});

export const UpdateProductFieldInlineSchema = z
  .object({
    pe_system_client_id: z.number().int().min(0).optional(),
    pe_organization_id: z.string().max(200).optional(),
    pe_user_id: z.string().max(200).optional(),
    pe_user_name: z.string().max(200).optional(),
    pe_user_role: z.string().max(200).optional(),
    pe_person_id: z.number().optional(),
    pe_register_id: z.number().int().positive(),
    pe_field_type: inlineFieldTypeSchema,
    pe_field: z.string().max(200).min(1),
    pe_value_str: z.string().optional(),
    pe_value_int: z.number().int().optional(),
    pe_value_numeric: z.number().optional(),
    pe_value_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.pe_field_type === 1 && typeof data.pe_value_str !== "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_str"],
        message: "pe_value_str é obrigatório quando pe_field_type = 1",
      });
    }

    if (data.pe_field_type === 2 && typeof data.pe_value_int !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_int"],
        message: "pe_value_int é obrigatório quando pe_field_type = 2",
      });
    }

    if (data.pe_field_type === 3 && typeof data.pe_value_numeric !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_numeric"],
        message: "pe_value_numeric é obrigatório quando pe_field_type = 3",
      });
    }

    if (data.pe_field_type === 4 && typeof data.pe_value_date !== "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_date"],
        message: "pe_value_date é obrigatório quando pe_field_type = 4",
      });
    }
  });

export const UpdateProductDescriptionInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_product_description: z.string().min(1),
});

export const UpdateProductNameInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_product_name: z.string().max(300).min(1),
});

export const UpdateProductImagePathInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_path_imagem: z.string().max(300).min(1),
});

export const UpdateProductShortDescriptionInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_descricao_curta: z.string().max(300).min(1),
});

export const UpdateProductStockMinInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_stock_min: z.number().int().min(0),
});

export const UpdateProductStockInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_stock: z.number().int().min(0),
});

export const UpdateProductTypeInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_type_id: z.number().int().positive(),
});

export const UpdateProductVariousInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_termo: z.string().max(300).min(1),
});

export type UpdateProductBrandInlineInput = z.infer<
  typeof UpdateProductBrandInlineSchema
>;
export type UpdateProductFieldInlineInput = z.infer<
  typeof UpdateProductFieldInlineSchema
>;
export type UpdateProductDescriptionInlineInput = z.infer<
  typeof UpdateProductDescriptionInlineSchema
>;
export type UpdateProductNameInlineInput = z.infer<
  typeof UpdateProductNameInlineSchema
>;
export type UpdateProductImagePathInlineInput = z.infer<
  typeof UpdateProductImagePathInlineSchema
>;
export type UpdateProductShortDescriptionInlineInput = z.infer<
  typeof UpdateProductShortDescriptionInlineSchema
>;
export type UpdateProductStockMinInlineInput = z.infer<
  typeof UpdateProductStockMinInlineSchema
>;
export type UpdateProductStockInlineInput = z.infer<
  typeof UpdateProductStockInlineSchema
>;
export type UpdateProductTypeInlineInput = z.infer<
  typeof UpdateProductTypeInlineSchema
>;
export type UpdateProductVariousInlineInput = z.infer<
  typeof UpdateProductVariousInlineSchema
>;
