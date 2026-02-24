import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_customer_id: z.number().int().positive(),
};

export const CustomerInlineEmailSchema = z.object({
  ...baseContextSchema,
  pe_email: z.string().max(200).optional(),
});

export const CustomerInlineNameSchema = z.object({
  ...baseContextSchema,
  pe_name: z.string().max(200).min(1),
});

export const CustomerInlineNotesSchema = z.object({
  ...baseContextSchema,
  pe_notes: z.string().optional(),
});

export const CustomerInlinePhoneSchema = z.object({
  ...baseContextSchema,
  pe_phone: z.string().max(200).optional(),
});

export const CustomerInlineSellerIdSchema = z.object({
  ...baseContextSchema,
  pe_seller_id: z.number().int().positive(),
});

export const CustomerInlineTypeCustomerSchema = z.object({
  ...baseContextSchema,
  pe_customer_type_id: z.number().int(),
});

export const CustomerInlineTypePersonSchema = z.object({
  ...baseContextSchema,
  pe_person_type_id: z.number().int(),
});

export const CustomerInlineWhatsappSchema = z.object({
  ...baseContextSchema,
  pe_whatsapp: z.string().max(200).min(1),
});

export type CustomerInlineEmailInput = z.infer<
  typeof CustomerInlineEmailSchema
>;
export type CustomerInlineNameInput = z.infer<typeof CustomerInlineNameSchema>;
export type CustomerInlineNotesInput = z.infer<
  typeof CustomerInlineNotesSchema
>;
export type CustomerInlinePhoneInput = z.infer<
  typeof CustomerInlinePhoneSchema
>;
export type CustomerInlineSellerIdInput = z.infer<
  typeof CustomerInlineSellerIdSchema
>;
export type CustomerInlineTypeCustomerInput = z.infer<
  typeof CustomerInlineTypeCustomerSchema
>;
export type CustomerInlineTypePersonInput = z.infer<
  typeof CustomerInlineTypePersonSchema
>;
export type CustomerInlineWhatsappInput = z.infer<
  typeof CustomerInlineWhatsappSchema
>;
