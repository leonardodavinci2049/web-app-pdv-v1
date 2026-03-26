import {
  CalendarDays,
  HelpCircle,
  Package2,
  Plus,
  Settings2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UIOrderDashboardDetails } from "@/services/api-main/order-sales/transformers/transformers";

interface HeaderPDVProps {
  details: UIOrderDashboardDetails | null;
}

function formatOrderDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getOrderStatusClassName(orderStatusId: number): string {
  switch (orderStatusId) {
    case 22:
      return "border-border bg-secondary text-secondary-foreground";
    case 11:
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case 12:
      return "border-primary/20 bg-primary/10 text-primary";
    case 13:
      return "border-primary/20 bg-primary/10 text-primary";
    case 14:
      return "border-primary/20 bg-primary/10 text-primary";
    case 17:
      return "border-primary/20 bg-primary/10 text-primary";
    default:
      return "border-border bg-muted text-foreground";
  }
}

export function HeaderOrderSection({ details }: HeaderPDVProps) {
  return (
    <header className="relative overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/70 p-4 text-foreground shadow-xl shadow-black/10 dark:shadow-black/30 md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-4">
            {details ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                      Pedido #{details.orderId}
                    </h2>

                    {details.orderStatus && (
                      <Badge
                        variant="outline"
                        className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${getOrderStatusClassName(details.orderStatusId)}`}
                      >
                        {details.orderStatus}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 backdrop-blur">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {details.orderDate
                      ? formatOrderDate(details.orderDate)
                      : "Data pendente"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 backdrop-blur">
                    <UserRound className="h-4 w-4 text-primary" />
                    Vendedor em atendimento
                  </span>
  
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  Nova venda em preparacao
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                  Organize cliente, itens, pagamento e fechamento em uma unica
                  superficie de trabalho.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button
              size="sm"
              className="rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] dark:shadow-primary/15 dark:hover:shadow-primary/25"
              asChild
            >
              <Link href="/dashboard/order/new-budget">
                <Plus className="h-4 w-4" />
                Novo Orçamento
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-border bg-background/80 text-foreground hover:bg-accent"
            >
              <Settings2 className="h-4.5 w-4.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-border bg-background/80 text-foreground hover:bg-accent"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        {details && (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Status comercial
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {details.orderStatus || "Aguardando definicao"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Financeiro
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {details.financialStatus || "Nao informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Entrega e retirada
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {details.deliveryStatus || "Pendente"}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
