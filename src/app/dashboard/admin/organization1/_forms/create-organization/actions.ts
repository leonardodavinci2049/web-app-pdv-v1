"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { createOrganizationSchema } from "./schema";

export type CreateOrganizationState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    slug?: string[];
  };
};

export async function createOrganizationAction(
  _prevState: CreateOrganizationState,
  formData: FormData,
): Promise<CreateOrganizationState> {
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
  };

  // Validate with Zod
  const validatedFields = createOrganizationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, slug } = validatedFields.data;

  try {
    await auth.api.createOrganization({
      headers: await headers(),
      body: {
        name,
        slug,
      },
    });

    revalidatePath("/dashboard/organization");

    return {
      success: true,
      message: "Organization created successfully",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "Failed to create organization",
    };
  }
}
