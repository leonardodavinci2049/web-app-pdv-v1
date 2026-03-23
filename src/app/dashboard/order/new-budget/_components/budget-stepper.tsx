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
    description: "Escolha quem vai receber o orçamento",
    icon: UserSearch,
  },
  {
    routeStep: BUDGET_FLOW_STEPS.cart,
    label: "Carrinho",
    description: "Monte e ajuste os itens do pedido",
    icon: Package,
  },
  {
    routeStep: BUDGET_FLOW_STEPS.payment,
    label: "Pagamento",
    description: "Defina a forma de pagamento",
    icon: CreditCard,
  },
  {
    routeStep: BUDGET_FLOW_STEPS.summary,
    label: "Resumo",
    description: "Valide o orçamento final",
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
    if (step === BUDGET_FLOW_STEPS.customer) return !orderId;
    if (step === BUDGET_FLOW_STEPS.cart) return !!customerId;
    if (step === BUDGET_FLOW_STEPS.payment) return !!orderId;
    if (step === BUDGET_FLOW_STEPS.summary) return !!orderId;
    return false;
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/95 shadow-sm backdrop-blur">
        <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                Progresso do fluxo
              </p>
              <h2 className="text-lg font-semibold text-foreground">
                {STEPS[currentStepIndex]?.label ?? "Cliente"}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Etapa {currentStepIndex + 1} de {STEPS.length}
            </p>
          </div>

          <nav aria-label="Progresso do orçamento">
            <ol className="flex items-start justify-between gap-2 overflow-x-auto pb-1">
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
                        "group flex w-full min-w-[88px] flex-col items-center gap-2 text-center transition-all",
                        isClickable && !isCurrent
                          ? "cursor-pointer"
                          : "cursor-default",
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all sm:h-11 sm:w-11",
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
                            "hidden max-w-24 text-[10px] leading-tight sm:block",
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
                            isCompleted
                              ? "bg-primary"
                              : "bg-muted-foreground/20",
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

      <div
        className={cn("min-h-80", isPending && "opacity-60 transition-opacity")}
      >
        {children}
      </div>
    </div>
  );
}
