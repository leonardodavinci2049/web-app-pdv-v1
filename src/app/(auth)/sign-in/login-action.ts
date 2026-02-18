"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import {
  errorMessages,
  validateLoginData,
} from "../_common-validations/validation";

// Definir o tipo do estado do formulário
type LoginState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
} | null;

/**
 * Server Action para autenticação com email/senha
 */
export const loginAction = async (
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> => {
  try {
    // Extrair dados do FormData
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validar dados com Zod
    const validationResult = validateLoginData(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: "Dados inválidos. Verifique os campos e tente novamente.",
        errors: validationResult.errors || {},
      };
    }

    // Garantir que os dados validados existem
    if (!validationResult.data) {
      return {
        success: false,
        message: "Erro na validação dos dados.",
      };
    }

    const { email, password } = validationResult.data;

    // Autenticar com Better-Auth
    await auth.api.signInEmail({
      body: { email, password },
    });

    // Se chegou até aqui, o login foi bem-sucedido
    // O redirect será tratado pelo middleware ou pela configuração do Better-Auth
    redirect("/dashboard");
  } catch (error) {
    // Tratar erro de redirect (este é esperado após login bem-sucedido)
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Login error:", error);

    // Tratar erros específicos do Better-Auth
    if (typeof error === "object" && error !== null) {
      // Verificar se é um erro de API com status 401 (Unauthorized)
      if (
        "statusCode" in error &&
        (error as { statusCode?: number }).statusCode === 401
      ) {
        return {
          success: false,
          message: errorMessages.invalidCredentials,
        };
      }

      // Verificar por mensagem de erro
      if ("message" in error) {
        const errorMessage = (error as { message?: string }).message || "";

        if (
          errorMessage.includes("Invalid email or password") ||
          errorMessage.includes("User not found")
        ) {
          return {
            success: false,
            message: errorMessages.invalidCredentials,
          };
        }

        if (errorMessage.includes("Account disabled")) {
          return {
            success: false,
            message: errorMessages.accountDisabled,
          };
        }
      }
    }

    // Erro genérico
    return {
      success: false,
      message: errorMessages.serverError,
    };
  }
};

export default loginAction;
