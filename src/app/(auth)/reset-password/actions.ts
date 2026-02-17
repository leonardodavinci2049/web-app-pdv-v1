"use server";

import { auth } from "@/lib/auth/auth";
import { resetPasswordSchema } from "./schema";

export type ResetPasswordState = {
  success: boolean;
  message: string;
  errors?: {
    token?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const rawData = {
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  // Validate with Zod
  const validatedFields = resetPasswordSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validatedFields.data;

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: password,
        token,
      },
    });

    return {
      success: true,
      message:
        "Password reset successfully. You can now sign in with your new password.",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message:
        e.message || "Failed to reset password. The token may have expired.",
    };
  }
}
