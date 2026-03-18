"use client";

import { Banknote, CreditCard, Landmark, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentButtonProps {
  icon: string;
  label: string;
  color: string;
  isActive?: boolean;
  isRecommended?: boolean;
  onClick?: () => void;
}

const iconMap = {
  banknote: Banknote,
  "credit-card": CreditCard,
  landmark: Landmark,
  "qr-code": QrCode,
};

export function PaymentButtonSection({
  icon,
  label,
  color,
  isActive = false,
  isRecommended = false,
  onClick,
}: PaymentButtonProps) {
  const Icon = iconMap[icon as keyof typeof iconMap];

  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "h-14 w-full items-center justify-between gap-3 rounded-3xl border px-3.5 py-2.5 text-left shadow-none transition-all",
        "hover:-translate-y-0.5 hover:bg-accent/70",
        isActive
          ? "border-primary/25 bg-primary/10 shadow-lg shadow-black/10"
          : "border-border/70 bg-background/80 dark:bg-white/3",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="rounded-xl border border-border/60 bg-background/80 p-2 dark:bg-white/6">
          <Icon className={cn("h-4 w-4", color)} />
        </div>

        <p className="truncate text-[13px] font-semibold leading-none text-foreground sm:text-sm">
          {label}
        </p>
      </div>

      {isRecommended ? (
        <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
          Rec.
        </span>
      ) : null}
    </Button>
  );
}
