import {
  ArrowRight,
  CreditCard,
  MapPin,
  Package2,
  Percent,
  Tag,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
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

function DataPoint({
  icon: Icon,
  label,
  value,
  colSpan = 1,
}: {
  icon: typeof UserRound;
  label: string;
  value: string | number | null | undefined;
  colSpan?: 1 | 2;
}) {
  const content =
    value === null || value === undefined || value === "" ? "-" : value;

  return (
    <div className={cn("flex flex-col gap-1", colSpan === 2 && "col-span-2")}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span
        className="truncate text-sm font-medium text-foreground"
        title={String(content)}
      >
        {content}
      </span>
    </div>
  );
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card className="gap-0 flex flex-col h-full overflow-hidden rounded-xl border-border/70 bg-card/95 shadow-xs transition-shadow hover:shadow-sm">
      <CardHeader className="gap-3 border-b border-border/70 bg-gradient-to-br from-card via-card to-muted/35 p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight">
              Pedido #{order.orderId}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              {toDate(order.saleDate, order.orderDate || order.budgetDate)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 max-w-[50%]">
            <Badge
              variant="outline"
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider w-full justify-center truncate",
                getOrderStatusClassName(order.orderStatus, order.orderStatusId),
              )}
            >
              <span className="truncate">{order.orderStatus || "Venda"}</span>
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider w-full justify-center truncate",
                getFinancialStatusClassName(
                  order.financialStatus,
                  order.financialStatusId,
                ),
              )}
            >
              <span className="truncate">
                {order.financialStatus || "Pendente"}
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-y-4 gap-x-4 p-4 flex-1">
        <DataPoint
          icon={UserRound}
          label="Cliente"
          value={order.customerName}
          colSpan={2}
        />
        <DataPoint icon={Tag} label="Vendedor" value={order.sellerName} />
        <DataPoint icon={MapPin} label="Local" value={order.location} />
        <DataPoint
          icon={CreditCard}
          label="Pagamento"
          value={order.paymentForm}
        />
        <DataPoint icon={Package2} label="Itens" value={order.itemCount} />

        {order.deliveryStatus && (
          <DataPoint
            icon={Truck}
            label="Entrega"
            value={order.deliveryStatus}
          />
        )}

        {order.rateType && (
          <DataPoint icon={Percent} label="Taxa" value={order.rateType} />
        )}
      </CardContent>

      <CardFooter className="justify-between gap-3 border-t border-border/70 p-4 pt-3 bg-muted/10 mt-auto">
        <div>
          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
            Total
          </p>
          <p className="font-semibold tracking-tight text-base">
            {toCurrency(order.totalOrderValue)}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 text-xs font-medium"
        >
          <Link href={`/dashboard/sales-dashboard?orderId=${order.orderId}`}>
            Detalhes
            <ArrowRight className="size-3.5 ml-1.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
