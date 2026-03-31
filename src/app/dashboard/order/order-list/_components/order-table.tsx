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

function getFinancialStatusClassName(status: string, statusId: number): string {
  const normalized = normalizeText(status);

  if (
    normalized.includes("CONCL") ||
    normalized.includes("PAGO") ||
    normalized.includes("QUITADO")
  ) {
    return "border-primary/20 bg-primary/10 text-primary";
  }

  if (normalized.includes("ABERTO")) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }

  if (normalized.includes("PENDENTE") || statusId > 0) {
    return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300";
  }

  return "border-border bg-secondary text-secondary-foreground";
}

export function OrderTable({ orders }: OrderTableProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold">#ID</TableHead>
              <TableHead className="font-semibold max-w-[300px]">
                Cliente
              </TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Total</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">
                Vendedor
              </TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">
                Local
              </TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">
                Status Financeiro
              </TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">
                Pagamento
              </TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">
                Itens
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
                <TableCell className="max-w-[300px]">
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
                <TableCell className="text-right">
                  <span className="text-sm font-semibold">
                    {toCurrency(order.totalOrderValue)}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {order.sellerName || "-"}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {order.location || "-"}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md px-2 py-1 text-[10px] uppercase font-semibold tracking-wider",
                      getFinancialStatusClassName(
                        order.financialStatus,
                        order.financialStatusId,
                      ),
                    )}
                  >
                    {order.financialStatus || "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {order.paymentForm || "-"}
                  </span>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {order.itemCount}
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
  );
}
