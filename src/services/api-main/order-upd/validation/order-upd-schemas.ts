import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_order_id: z.number().int(),
};

export const OrderUpdCustomerSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
});

export const OrderUpdDiscountSchema = z.object({
  ...baseContextSchema,
  pe_discount_value: z.number(),
});

export const OrderUpdFreteSchema = z.object({
  ...baseContextSchema,
  pe_frete_value: z.number(),
});

export const OrderUpdNotesSchema = z.object({
  ...baseContextSchema,
  pe_notes: z.string().max(500).optional(),
});

export const OrderUpdPgMethodSchema = z.object({
  ...baseContextSchema,
  pe_pg_method_id: z.number().int(),
});

export const OrderUpdSellerSchema = z.object({
  ...baseContextSchema,
  pe_seller_id: z.number().int(),
});

export const OrderUpdStatusSchema = z.object({
  ...baseContextSchema,
  pe_status_id: z.number().int(),
});

export type OrderUpdCustomerInput = z.infer<typeof OrderUpdCustomerSchema>;
export type OrderUpdDiscountInput = z.infer<typeof OrderUpdDiscountSchema>;
export type OrderUpdFreteInput = z.infer<typeof OrderUpdFreteSchema>;
export type OrderUpdNotesInput = z.infer<typeof OrderUpdNotesSchema>;
export type OrderUpdPgMethodInput = z.infer<typeof OrderUpdPgMethodSchema>;
export type OrderUpdSellerInput = z.infer<typeof OrderUpdSellerSchema>;
export type OrderUpdStatusInput = z.infer<typeof OrderUpdStatusSchema>;
