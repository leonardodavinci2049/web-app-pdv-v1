export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  fieldValues?: Record<string, string>;
  data?: Record<string, unknown>;
} | null;
