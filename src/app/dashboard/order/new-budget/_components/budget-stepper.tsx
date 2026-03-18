"use client";

import {
  Check,
  ClipboardList,
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
    id: 1,
    label: "Cliente",
    description: "Selecionar cliente",
    icon: UserSearch,
  },
  {
    id: 2,
    label: "Pedido",
    description: "Criar pedido",
    icon: ClipboardList,
  },
  {
    id: 3,
    label: "Produtos",
    description: "Adicionar itens",
    icon: Package,
  },
  {
    id: 4,
    label: "Pagamento",
    description: "Forma de pagamento",
    icon: CreditCard,
  },
  {
    id: 5,
    label: "Resumo",
    description: "Fechar orçamento",
    icon: ShoppingCart,
  },
];

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

  const canNavigateToStep = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return false;
    if (step === 3) return !!customerId && !!orderId;
    if (step === 4) return !!orderId;
    if (step === 5) return !!orderId;
    return false;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="px-2 py-4 sm:px-6">
          <nav aria-label="Progresso do orçamento">
            <ol className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isClickable = canNavigateToStep(step.id);
                const Icon = step.icon;

                return (
                  <li key={step.id} className="flex flex-1 items-center">
                    <button
                      type="button"
                      onClick={() => isClickable && navigateToStep(step.id)}
                      disabled={!isClickable || isPending}
                      className={cn(
                        "group flex w-full flex-col items-center gap-1.5 transition-all",
                        isClickable && !isCurrent
                          ? "cursor-pointer"
                          : "cursor-default",
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all sm:h-12 sm:w-12",
                          isCompleted &&
                            "border-primary bg-primary text-primary-foreground shadow-sm",
                          isCurrent &&
                            "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                          !isCompleted &&
                            !isCurrent &&
                            "border-muted-foreground/25 text-muted-foreground/40",
                          isClickable &&
                            !isCurrent &&
                            "group-hover:border-primary/50 group-hover:text-primary/60",
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                      </div>

                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "text-xs font-semibold sm:text-sm",
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
                            "hidden text-[10px] sm:block",
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
                      <div className="mx-1 mb-6 flex flex-1 items-center sm:mx-2">
                        <div
                          className={cn(
                            "h-0.5 w-full rounded-full transition-colors",
                            isCompleted
                              ? "bg-primary"
                              : "bg-muted-foreground/15",
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
        className={cn(
          "min-h-[400px]",
          isPending && "opacity-60 transition-opacity",
        )}
      >
        {children}
      </div>
    </div>
  );
}
