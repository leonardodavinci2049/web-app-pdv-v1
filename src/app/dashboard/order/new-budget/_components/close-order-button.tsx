"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CloseOrderButtonProps {
  orderId: number;
}

export function CloseOrderButton({ orderId }: CloseOrderButtonProps) {
  const params = new URLSearchParams();
  params.set("step", "5");
  params.set("orderId", String(orderId));
  const href = `/dashboard/order/new-budget?${params.toString()}`;

  return (
    <Button asChild size="lg" className="w-full">
      <Link href={href}>
        <ArrowRight className="mr-2 h-4 w-4" />
        Ver resumo do orçamento
      </Link>
    </Button>
  );
}
