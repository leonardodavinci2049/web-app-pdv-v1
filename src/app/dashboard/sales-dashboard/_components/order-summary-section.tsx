import { ShieldCheck, Tag, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  UIOrderCustomer,
  UIOrderDashboardDetails,
  UIOrderDashboardItem,
  UIOrderSalesSummary,
} from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";
import { FinalizeSaleButton } from "./finalize-sale-button";
import { PaymentMethodsSection } from "./payment-methods-section";
import { PrintOrderButton } from "./print-order-button";
import { SendWhatsAppButton } from "./send-whatsapp-button";

interface OrderSummaryProps {
  summary: UIOrderSalesSummary | null;
  details: UIOrderDashboardDetails | null;
  items: UIOrderDashboardItem[];
  customer: UIOrderCustomer | null;
  orderStatusId: number;
}

export function OrderSummarySection({
  summary,
  details,
  items,
  customer,
  orderStatusId,
}: OrderSummaryProps) {
  const subtotal = summary ? Number(summary.subtotalValue) : 0;
  const freight = summary ? Number(summary.freightValue) : 0;
  const additions = summary ? Number(summary.additionValue) : 0;
  const insurance = summary ? Number(summary.insuranceValue) : 0;
  const discount = summary ? Number(summary.discountValue) : 0;
  const total = summary ? Number(summary.totalOrderValue) : 0;

  const breakdown = [
    { label: "Subtotal", value: subtotal },
    { label: "Frete", value: freight },
    { label: "Adicionais", value: additions },
    { label: "Seguro", value: insurance },
  ];

  return (
    <Card className="overflow-hidden rounded-[28px] border-border/70 bg-linear-to-b from-card via-card to-muted/40 p-0 shadow-xl shadow-black/10 dark:shadow-black/30">
      <div className="border-b border-border/60 px-5 py-5 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <WalletCards className="h-3.5 w-3.5" />
              Resumo do pedido
            </div>
          </div>

          <Badge className="rounded-full bg-primary/10 px-3 text-primary hover:bg-primary/10">
            Pronto para concluir
          </Badge>
        </div>

        <div className="mt-5 rounded-[24px] border border-primary/15 bg-primary/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Total da operacao
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-[2.8rem]">
            {formatCurrency(total)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 dark:bg-white/6">
              {summary?.itemCount ?? 0} itens registrados
            </span>
            {discount > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
                Economia de {formatCurrency(discount)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
        <div className="rounded-[24px] border border-border/70 bg-background/75 p-4 dark:bg-white/4">
          <div className="space-y-3">
            {breakdown.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(row.value)}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-primary/20 bg-primary/10 px-3 py-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4 text-primary" />
                Desconto aplicado
              </span>
              <span className="font-semibold text-foreground">
                - {formatCurrency(discount)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3">
              <span className="text-base font-semibold text-foreground">
                Total final
              </span>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-background/75 p-4 dark:bg-white/4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                Formas de pagamento
              </h3>
            </div>

            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
          </div>

          <PaymentMethodsSection />
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <PrintOrderButton
              summary={summary}
              details={details}
              items={items}
              customer={customer}
            />
            <SendWhatsAppButton
              summary={summary}
              details={details}
              items={items}
              customer={customer}
            />
          </div>
          <FinalizeSaleButton
            orderId={summary?.orderId ?? 0}
            orderStatusId={orderStatusId}
          />
        </div>
      </div>
    </Card>
  );
}
