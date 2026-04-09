"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { UIOrderReportListItem } from "@/services/api-main/order-reports/transformers/transformers";

interface OrderTableProps {
  orders: UIOrderReportListItem[];
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
    return "border-primary/20 bg-primary/10 text-primary";
  }

  if (normalized.includes("ORCAMENTO")) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }

  if (
    normalized.includes("CANCEL") ||
    normalized.includes("ESTORNO") ||
    statusId === 11
  ) {
    return "border-destructive/20 bg-destructive/10 text-destructive";
  }

  return "border-border bg-secondary text-secondary-foreground";
}

export function OrderTable({ orders }: OrderTableProps) {
  return (
    <>
      {/* Mobile: Card layout */}
      <div className="grid gap-3 overflow-hidden p-3 sm:p-4 md:hidden">
        {orders.map((order) => (
          <Link
            key={order.orderId}
            href={`/dashboard/sales-dashboard?orderId=${order.orderId}`}
            className="group block min-w-0"
          >
            <article className="min-w-0 overflow-hidden rounded-xl border border-border/80 bg-neutral-50 p-3 shadow-sm transition-all hover:border-primary/30 hover:bg-neutral-100 hover:shadow-md dark:border-border/80 dark:bg-neutral-900/50 dark:hover:bg-neutral-900/80">
              {/* Row 1: ID + date */}
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 rounded-full border border-border/40 bg-background px-2 py-0.5 font-mono text-[10px] shadow-sm text-muted-foreground">
                  #{order.orderId}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {toDate(order.saleDate, order.orderDate || order.budgetDate)}
                </span>
              </div>

              {/* Row 2: Customer name */}
              <p className="mt-1.5 min-w-0 truncate text-sm font-semibold text-foreground">
                {order.customerName || "-"}
              </p>

              {/* Row 3: Total + items + payment */}
              <div className="mt-1 flex items-center gap-x-2 overflow-hidden text-xs text-muted-foreground">
                <span className="shrink-0 font-semibold text-foreground">
                  {toCurrency(order.totalOrderValue)}
                </span>
                {order.itemCount > 0 && (
                  <>
                    <span className="shrink-0 text-border">·</span>
                    <span className="shrink-0">
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "itens"}
                    </span>
                  </>
                )}
                {order.paymentForm && (
                  <>
                    <span className="shrink-0 text-border">·</span>
                    <span className="min-w-0 truncate">
                      {order.paymentForm}
                    </span>
                  </>
                )}
              </div>

              {/* Row 4: Status badge + seller + arrow */}
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider",
                      getOrderStatusClassName(
                        order.orderStatus,
                        order.orderStatusId,
                      ),
                    )}
                  >
                    {order.orderStatus || "Venda"}
                  </Badge>
                  {order.sellerName && (
                    <span className="min-w-0 truncate text-[11px] text-muted-foreground">
                      {order.sellerName}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full border border-border/40 bg-background text-muted-foreground shadow-sm transition-colors group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block rounded-xl border border-border/70 bg-card/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold">#ID</TableHead>
                <TableHead className="font-semibold max-w-75">
                  Cliente
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">
                  Financeiro
                </TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">
                  Tipo
                </TableHead>
                <TableHead className="font-semibold">Itens</TableHead>
                <TableHead className="font-semibold text-right">
                  Desconto
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Frete
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Total
                </TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">
                  Pagamento
                </TableHead>
                <TableHead className="font-semibold hidden lg:table-cell text-right">
                  Comissão
                </TableHead>
                <TableHead className="font-semibold text-right w-24">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId} className="group">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        #{order.orderId}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {toDate(
                          order.saleDate,
                          order.orderDate || order.budgetDate,
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-75">
                    <div className="flex flex-col">
                      <span className="text-sm truncate">
                        {order.customerName || "-"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{order.customerId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md px-2 py-1 text-[10px] uppercase font-semibold tracking-wider",
                        getOrderStatusClassName(
                          order.orderStatus,
                          order.orderStatusId,
                        ),
                      )}
                    >
                      {order.orderStatus || "Venda"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {order.financialStatus || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {order.rateType || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {order.itemCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-muted-foreground">
                      {toCurrency(order.discountValue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-muted-foreground">
                      {toCurrency(order.freightValue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-semibold">
                      {toCurrency(order.totalOrderValue)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {order.paymentForm || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right">
                    <span className="text-sm text-muted-foreground">
                      {toCurrency(order.sellerCommissionValue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      <Link
                        href={`/dashboard/sales-dashboard?orderId=${order.orderId}`}
                      >
                        Detalhes
                        <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
