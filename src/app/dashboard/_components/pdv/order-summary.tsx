import { Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { UIOrderSalesSummary } from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";
import { PaymentMethods } from "./payment-methods";

interface OrderSummaryProps {
  summary: UIOrderSalesSummary | null;
}

export function OrderSummary({ summary }: OrderSummaryProps) {
  const subtotal = summary ? Number(summary.subtotalValue) : 0;
  const discount = summary ? Number(summary.discountValue) : 0;
  const total = summary ? Number(summary.totalOrderValue) : 0;

  return (
    <Card className="h-auto md:h-full p-6 bg-card border-border flex flex-col shrink-0">
      <h2 className="text-xl font-semibold mb-6 text-foreground">
        Resumo do Pedido
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm items-center">
          <span className="text-muted-foreground">Desconto:</span>
          <div className="flex items-center gap-1">
            <span className="font-medium">- {formatCurrency(discount)}</span>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="border-t border-border pt-3 flex justify-between">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-semibold">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-foreground">
          Formas de Pagamento
        </h3>
        <PaymentMethods />
      </div>

      <div className="md:mt-auto space-y-3">
        <Button variant="secondary" className="w-full" size="lg">
          Salvar Orçamento
        </Button>
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          Finalizar Venda
        </Button>
      </div>
    </Card>
  );
}
