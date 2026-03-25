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

import { BUDGET_FLOW_STEPS } from "../budget-flow";

const STEPS = [
  {
    routeStep: BUDGET_FLOW_STEPS.customer,
    label: "Cliente",
    icon: UserSearch,
  },
  {
    routeStep: BUDGET_FLOW_STEPS.cart,
    label: "Carrinho",
    icon: Package,
  },
  {
    routeStep: BUDGET_FLOW_STEPS.payment,
    label: "Pagamento",
    icon: CreditCard,
  },
  {
    routeStep: BUDGET_FLOW_STEPS.summary,
    label: "Resumo",
    icon: ShoppingCart,
  },
] as const;

interface BudgetStepperProps {
  currentStep: number;
  customerId?: number;
  customerName?: string;
  orderId?: number;
  children: ReactNode;
}

export function BudgetStepper({
  currentStep,
  customerId,
  customerName,
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
    if (step === BUDGET_FLOW_STEPS.customer) return !orderId;
    if (step === BUDGET_FLOW_STEPS.cart) return !!customerId;
    if (step === BUDGET_FLOW_STEPS.payment) return !!orderId;
    if (step === BUDGET_FLOW_STEPS.summary) return !!orderId;
    return false;
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/95 shadow-sm backdrop-blur">
        <CardContent className="space-y-2 px-4 py-2 sm:px-6 sm:py-2.5">
          <div className="flex justify-end">
            <p className="text-sm text-muted-foreground">
              Etapa {currentStepIndex + 1} de {STEPS.length} —{"  "}
              <span className="font-medium text-foreground">
                {STEPS[currentStepIndex]?.label ?? "> Cliente"}
              </span>
            </p>
          </div>

          <nav aria-label="Progresso do orçamento" className="relative">
            <ol className="flex items-start justify-between gap-1 overflow-x-auto pb-2 sm:gap-2 sm:pb-0 scrollbar-none">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isClickable = canNavigateToStep(step.routeStep);
                const isLocked =
                  step.routeStep === BUDGET_FLOW_STEPS.customer && !!orderId;
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
                        "group flex w-full min-w-[50px] flex-col items-center gap-1.5 text-center transition-all sm:min-w-[88px]",
                        isClickable && !isCurrent
                          ? "cursor-pointer"
                          : "cursor-default",
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all sm:h-11 sm:w-11",
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
                          <Check className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                        ) : (
                          <Icon className="h-3 w-3 sm:h-5 sm:w-5" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-col items-center">
                        <span
                          className={cn(
                            "text-[9px] font-semibold sm:text-xs tracking-tight",
                            isCompleted && "text-primary",
                            isCurrent && "text-primary",
                            !isCompleted &&
                              !isCurrent &&
                              "text-muted-foreground/60",
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                    </button>

                    {index < STEPS.length - 1 && (
                      <div className="flex flex-1 items-center justify-center gap-0.5 px-0 pt-2 sm:gap-1.5 sm:px-2 sm:pt-3">
                        <div
                          className={cn(
                            "h-px w-2 sm:h-0.5 sm:w-6 rounded-full transition-colors hidden min-[360px]:block",
                            isCompleted
                              ? "bg-primary"
                              : "bg-muted-foreground/20",
                          )}
                        />
                        <ArrowRight
                          className={cn(
                            "h-3 w-3 shrink-0 stroke-[2.5] transition-colors sm:h-5 sm:w-5",
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

          {currentStepIndex > 0 && customerId && (
            <div className="flex items-center gap-1.5 border-t border-border/40 pt-1.5 text-xs text-muted-foreground">
              <UserSearch className="h-3 w-3 shrink-0" />
              <span className="font-medium">#{customerId}</span>
              {customerName && (
                <>
                  <span className="text-muted-foreground/40">—</span>
                  <span className="truncate">{customerName}</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div
        className={cn("min-h-80", isPending && "opacity-60 transition-opacity")}
      >
        {children}
      </div>
    </div>
  );
}
