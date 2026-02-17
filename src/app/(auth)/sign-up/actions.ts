"use server";

import { auth } from "@/lib/auth/auth";
import { signUpSchema } from "./schema";

export type SignUpState = {
  success: boolean;
  message: string;
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
  };
};

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const rawData = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Validate with Zod
  const validatedFields = signUpSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, email, password } = validatedFields.data;

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: username,
      },
    });

    return {
      success: true,
      message:
        "Account created successfully. Please check your email for verification.",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "Failed to create account",
    };
  }
}
