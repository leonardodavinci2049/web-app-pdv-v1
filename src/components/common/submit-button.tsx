"use client";

import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps
  extends Omit<ComponentProps<typeof Button>, "type" | "disabled"> {
  pendingText?: string;
}

export function SubmitButton({
  children,
  pendingText,
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn("w-full", className)}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
