"use client";

import Form from "next/form";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/common/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type CreateOrganizationState,
  createOrganizationAction,
} from "./actions";

const initialState: CreateOrganizationState = {
  success: false,
  message: "",
};

interface CreateOrganizationFormProps {
  onSuccess?: () => void;
}

export function CreateOrganizationForm({
  onSuccess,
}: CreateOrganizationFormProps) {
  const [state, formAction] = useActionState(
    createOrganizationAction,
    initialState,
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        onSuccess?.();
      } else if (!state.errors) {
        toast.error(state.message);
      }
    }
  }, [state, onSuccess]);

  return (
    <Form action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label
          htmlFor="name"
          className={state.errors?.name ? "text-destructive" : ""}
        >
          Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="My Organization"
          required
          minLength={2}
          maxLength={50}
          aria-describedby="name-error"
          aria-invalid={!!state.errors?.name}
        />
        {state.errors?.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label
          htmlFor="slug"
          className={state.errors?.slug ? "text-destructive" : ""}
        >
          Slug
        </Label>
        <Input
          id="slug"
          name="slug"
          type="text"
          placeholder="my-org"
          required
          minLength={2}
          maxLength={50}
          pattern="^[a-z0-9-]+$"
          title="Only lowercase letters, numbers, and hyphens are allowed"
          aria-describedby="slug-error"
          aria-invalid={!!state.errors?.slug}
        />
        {state.errors?.slug && (
          <p id="slug-error" className="text-sm text-destructive" role="alert">
            {state.errors.slug[0]}
          </p>
        )}
      </div>

      <SubmitButton pendingText="Creating...">Create Organization</SubmitButton>
    </Form>
  );
}
