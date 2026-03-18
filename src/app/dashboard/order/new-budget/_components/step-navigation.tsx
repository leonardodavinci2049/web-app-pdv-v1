"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  nextStep: number;
  orderId: number;
  customerId?: number;
  disabled?: boolean;
  nextLabel: string;
}

export function StepNavigation({
  nextStep,
  orderId,
  customerId,
  disabled,
  nextLabel,
}: StepNavigationProps) {
  const params = new URLSearchParams();
  params.set("step", String(nextStep));
  params.set("orderId", String(orderId));
  if (customerId) params.set("customerId", String(customerId));

  const href = `/dashboard/order/new-budget?${params.toString()}`;

  if (disabled) {
    return (
      <div className="flex justify-end">
        <Button disabled>
          {nextLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button asChild>
        <Link href={href}>
          {nextLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
