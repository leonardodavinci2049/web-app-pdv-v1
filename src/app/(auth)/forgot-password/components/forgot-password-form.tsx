"use client";

import Form from "next/form";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/common/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type ForgotPasswordState, forgotPasswordAction } from "../actions";

const initialState: ForgotPasswordState = {
  success: false,
  message: "",
};

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else if (!state.errors) {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form action={formAction} className="space-y-8">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className={state.errors?.email ? "text-destructive" : ""}
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    aria-describedby="email-error"
                    aria-invalid={!!state.errors?.email}
                  />
                  {state.errors?.email && (
                    <p
                      id="email-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {state.errors.email[0]}
                    </p>
                  )}
                </div>
              </div>
              <SubmitButton pendingText="Sending...">
                Reset Password
              </SubmitButton>
            </div>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link className="underline underline-offset-4" href="/sign-up">
                Sign up
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  );
}
