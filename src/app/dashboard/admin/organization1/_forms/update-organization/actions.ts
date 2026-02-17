"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { updateOrganizationSchema } from "./schema";

export type UpdateOrganizationState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    slug?: string[];
    organizationId?: string[];
  };
};

export async function updateOrganizationAction(
  _prevState: UpdateOrganizationState,
  formData: FormData,
): Promise<UpdateOrganizationState> {
  const rawData = {
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
  };

  // Validate with Zod
  const validatedFields = updateOrganizationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { organizationId, name, slug } = validatedFields.data;

  try {
    await auth.api.updateOrganization({
      headers: await headers(),
      body: {
        organizationId,
        data: {
          name,
          slug,
        },
      },
    });

    revalidatePath("/dashboard/organization");

    return {
      success: true,
      message: "Organization updated successfully",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "Failed to update organization",
    };
  }
}
