import { z } from "zod";

// Schema base de contexto reutilizável
const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

export const OrderItemsFindAllSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int().optional(),
  pe_limit: z.number().int().positive().optional(),
});

export const OrderItemsFindByIdSchema = z.object({
  ...baseContextSchema,
  pe_order_item_id: z.number().int().positive(),
});

export const OrderItemsDeleteSchema = z.object({
  ...baseContextSchema,
  pe_movement_id: z.number().int().optional(),
});

export const OrderItemsDiscountSchema = z.object({
  ...baseContextSchema,
  pe_order_item_id: z.number().int().positive(),
  pe_discount_value: z.number(),
});

export const OrderItemsDiscountAdmSchema = z.object({
  ...baseContextSchema,
  pe_order_item_id: z.number().int().positive(),
  pe_discount_adm_value: z.number(),
});

export const OrderItemsFreteVlSchema = z.object({
  ...baseContextSchema,
  pe_order_item_id: z.number().int().positive(),
  pe_frete_value: z.number(),
});

export const OrderItemsInsuranceVlSchema = z.object({
  ...baseContextSchema,
  pe_order_item_id: z.number().int().positive(),
  pe_insurance_value: z.number(),
});

export const OrderItemsNotesSchema = z.object({
  ...baseContextSchema,
  pe_order_item_id: z.number().int().positive(),
  pe_notes: z.string().max(500).optional(),
});

export const OrderItemsQtSchema = z.object({
  ...baseContextSchema,
  pe_order_item_id: z.number().int().positive(),
  pe_quantity: z.number().int().min(1),
});

export const OrderItemsValueSchema = z.object({
  ...baseContextSchema,
  pe_order_item_id: z.number().int().positive(),
  pe_item_value: z.number(),
});

export type OrderItemsFindAllInput = z.infer<typeof OrderItemsFindAllSchema>;
export type OrderItemsFindByIdInput = z.infer<typeof OrderItemsFindByIdSchema>;
export type OrderItemsDeleteInput = z.infer<typeof OrderItemsDeleteSchema>;
export type OrderItemsDiscountInput = z.infer<typeof OrderItemsDiscountSchema>;
export type OrderItemsDiscountAdmInput = z.infer<
  typeof OrderItemsDiscountAdmSchema
>;
export type OrderItemsFreteVlInput = z.infer<typeof OrderItemsFreteVlSchema>;
export type OrderItemsInsuranceVlInput = z.infer<
  typeof OrderItemsInsuranceVlSchema
>;
export type OrderItemsNotesInput = z.infer<typeof OrderItemsNotesSchema>;
export type OrderItemsQtInput = z.infer<typeof OrderItemsQtSchema>;
export type OrderItemsValueInput = z.infer<typeof OrderItemsValueSchema>;
