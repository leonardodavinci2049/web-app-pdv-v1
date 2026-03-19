"use client";

import {
  ArrowRight,
  Check,
  CreditCard,
  Package,
  ShoppingCart,
  UserSearch,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useTransition } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    routeStep: 1,
    label: "Cliente",
    description: "Selecionar cliente",
    icon: UserSearch,
  },
  {
    routeStep: 3,
    label: "Produto",
    description: "Adicionar itens",
    icon: Package,
  },
  {
    routeStep: 4,
    label: "Pagamento",
    description: "Forma de pagamento",
    icon: CreditCard,
  },
  {
    routeStep: 5,
    label: "Resumo",
    description: "Conferir orçamento",
    icon: ShoppingCart,
  },
] as const;

interface BudgetStepperProps {
  currentStep: number;
  customerId?: number;
  orderId?: number;
  children: ReactNode;
}

export function BudgetStepper({
  currentStep,
  customerId,
  orderId,
  children,
}: BudgetStepperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentStepIndex = Math.max(
    STEPS.findIndex((step) => step.routeStep === currentStep),
    0,
  );

  const navigateToStep = useCallback(
    (step: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", String(step));
      params.delete("search");

      if (customerId) params.set("customerId", String(customerId));
      if (orderId) params.set("orderId", String(orderId));

      startTransition(() => {
        router.push(`/dashboard/order/new-budget?${params.toString()}`);
      });
    },
    [searchParams, customerId, orderId, router],
  );

  const canNavigateToStep = (step: (typeof STEPS)[number]["routeStep"]) => {
    if (step === 1) return !orderId;
    if (step === 3) return !!customerId;
    if (step === 4) return !!orderId;
    if (step === 5) return !!orderId;
    return false;
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="px-3 py-3 sm:px-5 sm:py-4">
          <nav aria-label="Progresso do orçamento">
            <ol className="flex items-start justify-between gap-2">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isClickable = canNavigateToStep(step.routeStep);
                const isLocked = step.routeStep === 1 && !!orderId;
                const Icon = step.icon;

                return (
                  <li
                    key={step.routeStep}
                    className="flex min-w-0 flex-1 items-start"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        isClickable && navigateToStep(step.routeStep)
                      }
                      disabled={!isClickable || isPending}
                      className={cn(
                        "group flex w-full min-w-0 flex-col items-center gap-1 text-center transition-all",
                        isClickable && !isCurrent
                          ? "cursor-pointer"
                          : "cursor-default",
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all sm:h-10 sm:w-10",
                          isCompleted &&
                            "border-primary bg-primary text-primary-foreground shadow-sm",
                          isCurrent &&
                            "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
                          !isCompleted &&
                            !isCurrent &&
                            "border-muted-foreground/25 text-muted-foreground/40",
                          isClickable &&
                            !isCurrent &&
                            "group-hover:border-primary/50 group-hover:text-primary/60",
                          isLocked && "opacity-60",
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-col items-center">
                        <span
                          className={cn(
                            "text-[11px] font-semibold sm:text-xs",
                            isCompleted && "text-primary",
                            isCurrent && "text-primary",
                            !isCompleted &&
                              !isCurrent &&
                              "text-muted-foreground/60",
                          )}
                        >
                          {step.label}
                        </span>
                        <span
                          className={cn(
                            "hidden text-[9px] leading-tight sm:block",
                            isCurrent
                              ? "text-muted-foreground"
                              : "text-muted-foreground/50",
                          )}
                        >
                          {step.description}
                        </span>
                      </div>
                    </button>

                    {index < STEPS.length - 1 && (
                      <div className="flex items-center gap-1 px-1 pt-3 sm:gap-1.5 sm:px-2">
                        <div
                          className={cn(
                            "h-0.5 w-4 rounded-full transition-colors sm:w-6",
                            isCompleted ? "bg-primary" : "bg-muted-foreground/20",
                          )}
                        />
                        <ArrowRight
                          className={cn(
                            "h-5 w-5 shrink-0 stroke-[2.5] transition-colors sm:h-6 sm:w-6",
                            isCompleted
                              ? "text-primary"
                              : "text-muted-foreground/35",
                          )}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </CardContent>
      </Card>

        <div className={cn("min-h-80", isPending && "opacity-60 transition-opacity")}>
        {children}
      </div>
    </div>
  );
}
