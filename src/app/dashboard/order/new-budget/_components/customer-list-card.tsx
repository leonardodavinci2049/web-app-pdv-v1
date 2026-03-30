"use client";

import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { cn } from "@/lib/utils";
import type { UICustomerListItem } from "@/services/api-main/customer-general/transformers/transformers";

import { BUDGET_FLOW_STEPS } from "../budget-flow";
import { CustomerDetailDialog } from "./customer-detail-dialog";

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
    params.set("customerId", String(customer.customerId));
    params.delete("orderId");
    params.delete("search");

    startTransition(() => {
      router.push(`/dashboard/order/new-budget?${params.toString()}`);
    });
  }, [customer.customerId, searchParams, router]);

  return (
    <div
      className={cn(
        "group flex w-full overflow-hidden items-center gap-2 rounded-xl border border-border/60 bg-neutral-100 p-2 text-left transition-all hover:bg-neutral-200/80 hover:shadow-sm dark:bg-neutral-700/60 dark:hover:bg-neutral-600/60 sm:gap-3 sm:p-3",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <CustomerDetailDialog customer={customer} />

      <button
        type="button"
        onClick={handleSelect}
        disabled={isPending}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
      >
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <p className="min-w-0 truncate text-sm font-semibold text-foreground">
              {customer.name}
            </p>
            <span className="hidden shrink-0 text-[10px] font-medium text-muted-foreground/70 sm:inline">
              #{customer.customerId}
            </span>
          </div>

          <div className="mt-0.5 flex items-center gap-x-2 overflow-hidden text-xs text-muted-foreground">
            {customer.customerType && (
              <span className="min-w-0 truncate">{customer.customerType}</span>
            )}
            {customer.customerType && customer.personType && (
              <span className="shrink-0 text-border">·</span>
            )}
            {customer.personType && (
              <span className="min-w-0 truncate">{customer.personType}</span>
            )}
          </div>
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </button>
    </div>
  );
}
