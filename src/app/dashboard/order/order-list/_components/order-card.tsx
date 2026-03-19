import {
  ArrowRight,
  CreditCard,
  MapPin,
  Package2,
  Tag,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UIOrderReportListItem } from "@/services/api-main/order-reports/transformers/transformers";

interface OrderCardProps {
  order: UIOrderReportListItem;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function toCurrency(value: string): string {
  const parsed = Number(value);
  return currencyFormatter.format(Number.isFinite(parsed) ? parsed : 0);
}

function toDate(value: string | null, fallback?: string): string {
  const dateValue = value ?? fallback;
  if (!dateValue) {
    return "Data indisponível";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Data indisponível";
  }

  return dateFormatter.format(parsed);
}

function getOrderStatusClassName(status: string, statusId: number): string {
  const normalized = normalizeText(status);

  if (
    normalized.includes("VENDA") ||
    statusId === 12 ||
    statusId === 13 ||
    statusId === 14 ||
    statusId === 17
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  if (normalized.includes("ORCAMENTO")) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }

  if (
    normalized.includes("CANCEL") ||
    normalized.includes("ESTORNO") ||
    statusId === 11
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300";
  }

  return "border-border bg-muted text-foreground";
}

function getFinancialStatusClassName(status: string, statusId: number): string {
  const normalized = normalizeText(status);

  if (
    normalized.includes("CONCL") ||
    normalized.includes("PAGO") ||
    normalized.includes("QUITADO")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  if (normalized.includes("ABERTO")) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }

  if (normalized.includes("PENDENTE") || statusId > 0) {
    return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300";
  }

  return "border-border bg-muted text-foreground";
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string | number | null | undefined;
}) {
  const content =
    value === null || value === undefined || value === "" ? "-" : value;

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-muted/30 px-3 py-2.5">
      <div className="mt-0.5 rounded-full bg-background p-1.5 shadow-sm">
        <Icon className="size-3.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.18em]">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium">{content}</p>
      </div>
    </div>
  );
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-[28px] border-border/70 bg-card/95 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="gap-4 border-b border-border/70 bg-gradient-to-br from-card via-card to-muted/35 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Pedido #{order.orderId}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {toDate(order.saleDate, order.orderDate || order.budgetDate)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                getOrderStatusClassName(order.orderStatus, order.orderStatusId),
              )}
            >
              {order.orderStatus || "Venda"}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                getFinancialStatusClassName(
                  order.financialStatus,
                  order.financialStatusId,
                ),
              )}
            >
              {order.financialStatus || "Pendente"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 py-5">
        <InfoRow icon={UserRound} label="Cliente" value={order.customerName} />
        <InfoRow icon={Tag} label="Vendedor" value={order.sellerName} />
        <InfoRow icon={MapPin} label="Local" value={order.location} />
        <InfoRow
          icon={CreditCard}
          label="Pagamento"
          value={order.paymentForm}
        />
        <InfoRow icon={Package2} label="Itens" value={order.itemCount} />

        {(order.deliveryStatus || order.rateType) && (
          <div className="grid gap-2 pt-1 sm:grid-cols-2">
            {order.deliveryStatus && (
              <div className="rounded-2xl border border-border/70 px-3 py-2.5">
                <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.18em]">
                  Entrega
                </p>
                <p className="mt-1 text-sm font-medium">
                  {order.deliveryStatus}
                </p>
              </div>
            )}

            {order.rateType && (
              <div className="rounded-2xl border border-border/70 px-3 py-2.5">
                <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.18em]">
                  Tipo de taxa
                </p>
                <p className="mt-1 text-sm font-medium">{order.rateType}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-4 border-t border-border/70 pt-5">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.2em]">
            Total
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight">
            {toCurrency(order.totalOrderValue)}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          aria-label={`Detalhes do pedido ${order.orderId} ainda indisponíveis`}
        >
          Detalhes em breve
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
