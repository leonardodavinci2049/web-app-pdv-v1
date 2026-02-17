"use server";

import { auth } from "@/lib/auth/auth";
import { signInSchema } from "./schema";

export type SignInState = {
  success: boolean;
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
};

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Validate with Zod
  const validatedFields = signInSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "Invalid email or password",
    };
  }
}
