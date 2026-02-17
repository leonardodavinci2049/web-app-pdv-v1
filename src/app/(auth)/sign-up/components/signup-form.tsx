"use client";

import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/common/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { type SignUpState, signUpAction } from "../actions";

const initialState: SignUpState = {
  success: false,
  message: "",
};

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [state, formAction] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        router.push("/dashboard");
      } else if (!state.errors) {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Signup with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                className="w-full"
                onClick={signInWithGoogle}
                type="button"
                variant="outline"
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <title>Google</title>
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Signup with Google
              </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
              <span className="relative z-10 bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
            <Form action={formAction} className="space-y-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="username"
                      className={
                        state.errors?.username ? "text-destructive" : ""
                      }
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      required
                      minLength={3}
                      maxLength={30}
                      aria-describedby="username-error"
                      aria-invalid={!!state.errors?.username}
                    />
                    {state.errors?.username && (
                      <p
                        id="username-error"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {state.errors.username[0]}
                      </p>
                    )}
                  </div>
                </div>
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
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="password"
                      className={
                        state.errors?.password ? "text-destructive" : ""
                      }
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
                    <Link
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                      href="/forgot-password"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
                <SubmitButton pendingText="Creating account...">
                  Signup
                </SubmitButton>
              </div>
            </Form>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link className="underline underline-offset-4" href="/sign-in">
                Login
              </Link>
            </div>
          </div>
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
