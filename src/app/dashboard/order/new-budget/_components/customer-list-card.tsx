"use client";

import { Phone, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UICustomerListItem } from "@/services/api-main/customer-general/transformers/transformers";

import { BUDGET_FLOW_STEPS } from "../budget-flow";

interface CustomerListCardProps {
  customer: UICustomerListItem;
}

export function CustomerListCard({ customer }: CustomerListCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSelect = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(BUDGET_FLOW_STEPS.cart));
    params.set("customerId", String(customer.id));
    params.delete("orderId");
    params.delete("search");

    startTransition(() => {
      router.push(`/dashboard/order/new-budget?${params.toString()}`);
    });
  }, [customer.id, searchParams, router]);

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent/30 hover:shadow-md",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <CardContent className="p-0">
        <button
          type="button"
          onClick={handleSelect}
          className="flex w-full items-start gap-4 p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <p className="truncate text-base font-semibold text-foreground">
                {customer.name}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Selecionar para iniciar o carrinho
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {customer.cpf && (
                <span className="rounded-full bg-background px-3 py-1 shadow-xs">
                  CPF {customer.cpf}
                </span>
              )}
              {customer.cnpj && (
                <span className="rounded-full bg-background px-3 py-1 shadow-xs">
                  CNPJ {customer.cnpj}
                </span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1 rounded-full bg-background px-3 py-1 shadow-xs">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </span>
              )}
            </div>

            {customer.email && (
              <p className="truncate text-sm text-muted-foreground">
                {customer.email}
              </p>
            )}
          </div>
        </button>
      </CardContent>
    </Card>
  );
}
