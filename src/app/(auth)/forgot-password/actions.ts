"use server";

import { auth } from "@/lib/auth/auth";
import { forgotPasswordSchema } from "./schema";

export type ForgotPasswordState = {
  success: boolean;
  message: string;
  errors?: {
    email?: string[];
  };
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const rawData = {
    email: formData.get("email"),
  };

  // Validate with Zod
  const validatedFields = forgotPasswordSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  try {
    // Using the better-auth API method for password reset
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: "/reset-password",
      },
    });

    return {
      success: true,
      message: "Password reset email sent. Please check your inbox.",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "Failed to send password reset email",
    };
  }
}
