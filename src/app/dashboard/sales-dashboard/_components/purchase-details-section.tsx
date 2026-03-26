import { Package2, Sparkles, Truck, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { UIOrderDashboardDetails } from "@/services/api-main/order-sales/transformers/transformers";

interface PurchaseDetailsSectionProps {
  details: UIOrderDashboardDetails | null;
}

export function PurchaseDetailsSection({
  details,
}: PurchaseDetailsSectionProps) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-border/70 bg-linear-to-b from-card via-card to-muted/40 p-0 shadow-xl shadow-black/10 dark:shadow-black/30">
      <div className="border-b border-border/60 px-5 py-4 md:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Informacoes da compra
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Detalhes da compra
          </h3>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
        {details ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Package2 className="h-4 w-4 text-primary" />
                Status comercial
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {details.orderStatus || "Aguardando definicao"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary" />
                Financeiro
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {details.financialStatus || "Nao informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" />
                Entrega e retirada
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {details.deliveryStatus || "Pendente"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-background/70 p-8 text-center dark:bg-white/4">
            <p className="text-lg font-semibold text-foreground">
              Sem detalhes disponiveis
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              As informacoes detalhadas sobre status comercial, financeiro e
              entrega serao exibidas aqui quando um pedido estiver carregado.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
