import { z } from "zod";

/**
 * Schema de validação para o formulário de login
 * Inclui validações básicas para email e senha
 */
export const loginSchema = z.object({
  email: z
    .string({ message: "O email é obrigatório." })
    .min(1, "O email é obrigatório.")
    .email("Por favor, insira um email válido.")
    .max(255, "O email deve ter no máximo 255 caracteres.")
    .toLowerCase()
    .transform((email) => email.trim()),

  password: z
    .string({ message: "A senha é obrigatória." })
    .min(1, "A senha é obrigatória.")
    .max(128, "A senha deve ter no máximo 128 caracteres."),
});

/**
 * Tipo TypeScript inferido do schema de login
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema de validação para o formulário de forgot password
 * Valida apenas o email para recuperação de senha
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: "O email é obrigatório." })
    .min(1, "O email é obrigatório.")
    .email("Por favor, insira um email válido.")
    .max(255, "O email deve ter no máximo 255 caracteres.")
    .toLowerCase()
    .transform((email) => email.trim()),
});

/**
 * Tipo TypeScript inferido do schema de forgot password
 */
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Schema de validação para o formulário de reset password
 * Valida nova senha e confirmação de senha
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string({ message: "A nova senha é obrigatória." })
      .min(1, "A nova senha é obrigatória.")
      .min(8, "A nova senha deve ter pelo menos 8 caracteres.")
      .max(128, "A nova senha deve ter no máximo 128 caracteres.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "A nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número.",
      )
      .regex(/^[^\s]*$/, "A nova senha não pode conter espaços."),

    confirmPassword: z
      .string({ message: "A confirmação da senha é obrigatória." })
      .min(1, "A confirmação da senha é obrigatória."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

/**
 * Tipo TypeScript inferido do schema de reset password
 */
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Schema de validação para o formulário de cadastro
 * Inclui validações robustas com mensagens amigáveis em português
 */
export const registerSchema = z.object({
  name: z
    .string({ message: "O nome é obrigatório." })
    .min(1, "O nome é obrigatório.")
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres.")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "O nome deve conter apenas letras e espaços.")
    .transform((name) =>
      name
        .trim()
        .split(/\s+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" "),
    ),

  email: z
    .string({ message: "O email é obrigatório." })
    .min(1, "O email é obrigatório.")
    .email("Por favor, insira um email válido.")
    .max(255, "O email deve ter no máximo 255 caracteres.")
    .toLowerCase()
    .transform((email) => email.trim()),

  password: z
    .string({ message: "A senha é obrigatória." })
    .min(1, "A senha é obrigatória.")
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(128, "A senha deve ter no máximo 128 caracteres.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número.",
    )
    .regex(/^[^\s]*$/, "A senha não pode conter espaços."),
});

/**
 * Schema para validação com confirmação de senha
 * Usado quando necessário confirmar a senha
 */
export const registerWithConfirmSchema = registerSchema
  .extend({
    confirmPassword: z
      .string({ message: "A confirmação de senha é obrigatória." })
      .min(1, "A confirmação de senha é obrigatória."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

/**
 * Tipo TypeScript inferido do schema
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Tipo TypeScript inferido do schema com confirmação
 */
export type RegisterWithConfirmFormData = z.infer<
  typeof registerWithConfirmSchema
>;

/**
 * Função utilitária para validar dados do formulário de login
 * Retorna dados validados ou erros formatados
 */
export function validateLoginData(data: unknown) {
  try {
    const validatedData = loginSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formatar erros para exibição amigável
      const formattedErrors = error.issues.reduce(
        (acc: Record<string, string>, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        },
        {},
      );

      return {
        success: false,
        data: null,
        errors: formattedErrors,
      };
    }

    return {
      success: false,
      data: null,
      errors: { general: "Erro de validação inesperado." },
    };
  }
}

/**
 * Função utilitária para validar dados do formulário de forgot password
 * Retorna dados validados ou erros formatados
 */
export function validateForgotPasswordData(data: unknown) {
  try {
    const validatedData = forgotPasswordSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formatar erros para exibição amigável
      const formattedErrors = error.issues.reduce(
        (acc: Record<string, string>, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        },
        {},
      );

      return {
        success: false,
        data: null,
        errors: formattedErrors,
      };
    }

    return {
      success: false,
      data: null,
      errors: { general: "Erro de validação inesperado." },
    };
  }
}

/**
 * Função utilitária para validar dados do formulário de reset password
 * Retorna dados validados ou erros formatados
 */
export function validateResetPasswordData(data: unknown) {
  try {
    const validatedData = resetPasswordSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formatar erros para exibição amigável
      const formattedErrors = error.issues.reduce(
        (acc: Record<string, string>, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        },
        {},
      );

      return {
        success: false,
        data: null,
        errors: formattedErrors,
      };
    }

    return {
      success: false,
      data: null,
      errors: { general: "Erro de validação inesperado." },
    };
  }
}

/**
 * Função utilitária para validar dados do formulário
 * Retorna dados validados ou erros formatados
 */
export function validateRegisterData(data: unknown) {
  try {
    const validatedData = registerSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formatar erros para exibição amigável
      const formattedErrors = error.issues.reduce(
        (acc: Record<string, string>, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        },
        {},
      );

      return {
        success: false,
        data: null,
        errors: formattedErrors,
      };
    }

    return {
      success: false,
      data: null,
      errors: { general: "Erro de validação inesperado." },
    };
  }
}

/**
 * Função utilitária para validar dados do formulário com confirmação de senha
 * Retorna dados validados ou erros formatados
 */
export function validateRegisterWithConfirmData(data: unknown) {
  try {
    const validatedData = registerWithConfirmSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formatar erros para exibição amigável
      const formattedErrors = error.issues.reduce(
        (acc: Record<string, string>, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        },
        {},
      );

      return {
        success: false,
        data: null,
        errors: formattedErrors,
      };
    }

    return {
      success: false,
      data: null,
      errors: { general: "Erro de validação inesperado." },
    };
  }
}

/**
 * Função para validar apenas um campo específico
 * Útil para validação em tempo real
 */
export function validateField(
  fieldName: keyof RegisterFormData,
  value: string,
) {
  try {
    const fieldSchema = registerSchema.shape[fieldName];
    const validatedValue = fieldSchema.parse(value);
    return {
      success: true,
      value: validatedValue,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        value: null,
        error: error.issues[0]?.message || "Valor inválido.",
      };
    }

    return {
      success: false,
      value: null,
      error: "Erro de validação inesperado.",
    };
  }
}

/**
 * Mensagens de erro personalizadas para diferentes cenários
 */
export const errorMessages = {
  // Erros de conectividade/servidor
  serverError: "Erro interno do servidor. Tente novamente em alguns instantes.",
  networkError: "Erro de conexão. Verifique sua internet e tente novamente.",

  // Erros de duplicidade
  emailExists:
    "Este email já está cadastrado. Tente fazer login ou use outro email.",

  // Erros de autenticação/login
  invalidCredentials: "Email ou senha incorretos.",
  accountDisabled: "Conta desabilitada. Entre em contato com o suporte.",
  loginSuccess: "Login realizado com sucesso!",

  // Forgot password
  forgotPasswordSuccess: "Enviamos instruções de recuperação para seu email.",
  emailNotFound: "Email não encontrado em nossa base de dados.",
  forgotPasswordError: "Erro ao enviar email de recuperação. Tente novamente.",

  // Sucesso
  registerSuccess: "Conta criada com sucesso! Bem-vindo(a)!",

  // Validação geral
  requiredFields: "Por favor, preencha todos os campos obrigatórios.",
} as const;
