import { PaymentButton } from "./payment-button";

const paymentMethods = [
  { id: "cash", icon: "banknote", label: "Dinheiro", color: "text-green-500" },
  {
    id: "credit",
    icon: "credit-card",
    label: "Cartão de Crédito",
    color: "text-blue-500",
  },
  {
    id: "debit",
    icon: "credit-card",
    label: "Cartão de Débito",
    color: "text-blue-400",
  },
  { id: "pix", icon: "qr-code", label: "Pix", color: "text-purple-500" },
  { id: "check", icon: "landmark", label: "Cheque", color: "text-yellow-500" },
];

export function PaymentMethods() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {paymentMethods.map((method) => (
        <PaymentButton
          key={method.id}
          icon={method.icon}
          label={method.label}
          color={method.color}
        />
      ))}
    </div>
  );
}
