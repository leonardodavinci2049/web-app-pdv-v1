"use client";

import {
  Banknote,
  CreditCard,
  Landmark,
  type LucideIcon,
  QrCode,
} from "lucide-react";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PaymentButtonSection } from "./payment-button-section";

interface PaymentMethod {
  id: string;
  icon: string;
  label: string;
  color: string;
  recommended?: boolean;
  Icon: LucideIcon;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    icon: "banknote",
    label: "Dinheiro",
    color: "text-primary",
    Icon: Banknote,
  },
  {
    id: "pix",
    icon: "qr-code",
    label: "Pix",
    color: "text-primary",
    recommended: true,
    Icon: QrCode,
  },
  {
    id: "credit",
    icon: "credit-card",
    label: "Cartao de Credito",
    color: "text-primary",
    Icon: CreditCard,
  },
  {
    id: "debit",
    icon: "credit-card",
    label: "Cartao de Debito",
    color: "text-primary",
    Icon: CreditCard,
  },
  {
    id: "boleto",
    icon: "landmark",
    label: "Boleto",
    color: "text-primary",
    Icon: Landmark,
  },
];

export function PaymentMethodsSection() {
  const [selectedMethod, setSelectedMethod] = useState("pix");

  const currentMethod =
    paymentMethods.find((method) => method.id === selectedMethod) ??
    paymentMethods[0];

  const CurrentIcon = currentMethod.Icon;

  return (
    <Accordion type="single" collapsible defaultValue="">
      <AccordionItem value="payment" className="border-0">
        <AccordionTrigger className="py-0 hover:no-underline">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <CurrentIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Pagamento</p>
              <p className="text-sm font-semibold text-foreground">
                {currentMethod.label}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0 pt-3">
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((method) => (
              <PaymentButtonSection
                key={method.id}
                icon={method.icon}
                label={method.label}
                color={method.color}
                isActive={selectedMethod === method.id}
                isRecommended={Boolean(method.recommended)}
                onClick={() => setSelectedMethod(method.id)}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
