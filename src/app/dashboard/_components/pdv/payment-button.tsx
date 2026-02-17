"use client";

import { Banknote, CreditCard, Landmark, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentButtonProps {
  icon: string;
  label: string;
  color: string;
}

const iconMap = {
  banknote: Banknote,
  "credit-card": CreditCard,
  landmark: Landmark,
  "qr-code": QrCode,
};

export function PaymentButton({ icon, label, color }: PaymentButtonProps) {
  const Icon = iconMap[icon as keyof typeof iconMap];

  return (
    <Button
      variant="outline"
      className="h-20 flex flex-col gap-2 bg-secondary/20 hover:bg-secondary/40 border-border"
    >
      <Icon className={`h-6 w-6 ${color}`} />
      <span className="text-xs text-foreground">{label}</span>
    </Button>
  );
}
