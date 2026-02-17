"use client";

import Form from "next/form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { type ResetPasswordState, resetPasswordAction } from "../actions";

const initialState: ResetPasswordState = {
  success: false,
  message: "",
};

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";

  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        router.push("/sign-in");
      } else if (!state.errors) {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link
                className="underline underline-offset-4"
                href="/forgot-password"
              >
                Request a new password reset
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form action={formAction} className="space-y-8">
            <input type="hidden" name="token" value={token} />
            <div className="grid gap-6">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className={state.errors?.password ? "text-destructive" : ""}
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="********"
                    required
                    minLength={8}
                    aria-describedby="password-error"
                    aria-invalid={!!state.errors?.password}
                  />
                  {state.errors?.password && (
                    <p
                      id="password-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {state.errors.password[0]}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label
                    htmlFor="confirmPassword"
                    className={
                      state.errors?.confirmPassword ? "text-destructive" : ""
                    }
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="********"
                    required
                    minLength={8}
                    aria-describedby="confirmPassword-error"
                    aria-invalid={!!state.errors?.confirmPassword}
                  />
                  {state.errors?.confirmPassword && (
                    <p
                      id="confirmPassword-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {state.errors.confirmPassword[0]}
                    </p>
                  )}
                </div>
              </div>
              <SubmitButton pendingText="Resetting password...">
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
