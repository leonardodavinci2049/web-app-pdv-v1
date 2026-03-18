import { Separator } from "@/components/ui/separator";
import type { UIOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";

import { PaymentMethodSelect } from "./payment-method-select";
import { StepNavigation } from "./step-navigation";

interface StepPaymentProps {
  orderDashboard: UIOrderDashboard | undefined;
  orderId: number;
}

export function StepPayment({ orderDashboard, orderId }: StepPaymentProps) {
  const summary = orderDashboard?.summary;
  const items = orderDashboard?.items ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Forma de Pagamento</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <PaymentMethodSelect orderId={orderId} />
        </div>

        <div className="space-y-3 rounded-lg border p-4">
          <h3 className="text-sm font-semibold">Resumo do Pedido</h3>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Itens</span>
              <span>{items.length}</span>
            </div>
            {summary && (
              <>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R$ {Number(summary.subtotalValue).toFixed(2)}</span>
                </div>
                {Number(summary.discountValue) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>-R$ {Number(summary.discountValue).toFixed(2)}</span>
                  </div>
                )}
                {Number(summary.freightValue) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span>R$ {Number(summary.freightValue).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>R$ {Number(summary.totalOrderValue).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <StepNavigation
        nextStep={5}
        orderId={orderId}
        nextLabel="Fechar Pedido"
      />
    </div>
  );
}
