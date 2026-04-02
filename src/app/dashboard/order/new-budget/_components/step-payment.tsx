import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UIOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";
import { formatCurrency } from "@/utils/common-utils";

import { CloseOrderButton } from "./close-order-button";
import { PaymentMethodSelect } from "./payment-method-select";

interface StepPaymentProps {
  orderDashboard: UIOrderDashboard | undefined;
  orderId: number;
  customerId?: number;
}

export function StepPayment({
  orderDashboard,
  orderId,
  customerId,
}: StepPaymentProps) {
  const summary = orderDashboard?.summary;
  const items = orderDashboard?.items ?? [];
  const selectedPaymentId = orderDashboard?.details?.paymentFormId;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
              Etapa 3
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Forma de pagamentos
              </h2>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Pedido atual #{orderId}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent>
            <PaymentMethodSelect
              orderId={orderId}
              defaultValue={selectedPaymentId ? String(selectedPaymentId) : "1"}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Resumo financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Itens</span>
                <span>{items.length}</span>
              </div>
              {summary && (
                <>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(Number(summary.subtotalValue))}</span>
                  </div>
                  {Number(summary.discountValue) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span>
                      <span>
                        -{formatCurrency(Number(summary.discountValue))}
                      </span>
                    </div>
                  )}
                  {Number(summary.freightValue) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Frete</span>
                      <span>
                        {formatCurrency(Number(summary.freightValue))}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>
                      {formatCurrency(Number(summary.totalOrderValue))}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CloseOrderButton orderId={orderId} customerId={customerId} />
    </div>
  );
}
