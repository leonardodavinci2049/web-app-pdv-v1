"use client";

import { Phone, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UICustomerListItem } from "@/services/api-main/customer-general/transformers/transformers";

interface CustomerListCardProps {
  customer: UICustomerListItem;
}

export function CustomerListCard({ customer }: CustomerListCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSelect = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", "3");
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
        "cursor-pointer transition-colors hover:bg-accent",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <CardContent className="p-4" onClick={handleSelect}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{customer.name}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {customer.cpf && <span>CPF: {customer.cpf}</span>}
              {customer.cnpj && <span>CNPJ: {customer.cnpj}</span>}
              {customer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </span>
              )}
            </div>
            {customer.email && (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {customer.email}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
