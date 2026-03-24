"use client";

import { ArrowRight, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
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
        "overflow-hidden border-border/60 bg-neutral-100 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-neutral-200/80 hover:shadow-md dark:bg-neutral-700/60 dark:hover:bg-neutral-600/60",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <Image
            src="/avatars/customer.png"
            alt={customer.name}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 truncate text-base font-semibold text-foreground">
                {customer.name}
              </p>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                #{customer.id}
              </span>
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

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {customer.customerType && (
                <span className="rounded-full bg-background px-3 py-1 shadow-xs">
                  Cliente: {customer.customerType}
                </span>
              )}
              {customer.personType && (
                <span className="rounded-full bg-background px-3 py-1 shadow-xs">
                  {customer.personType}
                </span>
              )}
              {customer.companyName && (
                <span className="rounded-full bg-background px-3 py-1 shadow-xs">
                  Empresa: {customer.companyName}
                </span>
              )}
            </div>

            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-1.5 truncate text-sm text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {customer.email}
              </a>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSelect}
            disabled={isPending}
            className="gap-1.5"
          >
            Selecionar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
