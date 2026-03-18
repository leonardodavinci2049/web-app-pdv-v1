"use client";

import { useState } from "react";
import { PaymentButtonSection } from "./payment-button-section";

const paymentMethods = [
  {
    id: "cash",
    icon: "banknote",
    label: "Dinheiro",
    color: "text-primary",
  },
  {
    id: "credit",
    icon: "credit-card",
    label: "Cartao de Credito",
    color: "text-primary",
  },
  {
    id: "debit",
    icon: "credit-card",
    label: "Cartao de Debito",
    color: "text-primary",
  },
  {
    id: "pix",
    icon: "qr-code",
    label: "Pix",
    color: "text-primary",
    recommended: true,
  },
  {
    id: "check",
    icon: "landmark",
    label: "Cheque",
    color: "text-primary",
  },
];

export function PaymentMethodsSection() {
  const [selectedMethod, setSelectedMethod] = useState("pix");

  const currentMethod =
    paymentMethods.find((method) => method.id === selectedMethod) ??
    paymentMethods[0];

  return (
    <div className="space-y-2">
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

      <div className="flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/10 px-3 py-2 text-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Metodo selecionado
        </p>
        <p className="font-semibold text-foreground">{currentMethod.label}</p>
      </div>
    </div>
  );
}
