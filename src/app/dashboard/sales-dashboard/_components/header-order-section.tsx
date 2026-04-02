import { CalendarDays, UserRound } from "lucide-react";
import type { UIOrderDashboardDetails } from "@/services/api-main/order-sales/transformers/transformers";

interface HeaderPDVProps {
  details: UIOrderDashboardDetails | null;
  customerName: string | null;
}

function formatOrderStatus(orderStatus: string): string {
  const normalizedStatus = orderStatus.toLocaleLowerCase("pt-BR");

  return (
    normalizedStatus.charAt(0).toLocaleUpperCase("pt-BR") +
    normalizedStatus.slice(1)
  );
}

function formatOrderDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function _getOrderStatusClassName(orderStatusId: number): string {
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

export function HeaderOrderSection({ details, customerName }: HeaderPDVProps) {
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
                      {formatOrderStatus(details.orderStatus)} #
                      {details.orderId}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 backdrop-blur">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {details.createdAt
                      ? formatOrderDate(details.createdAt)
                      : "Data pendente"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 backdrop-blur">
                    <UserRound className="h-4 w-4 text-primary" />
                    {customerName
                      ? `#${details.customerId} - ${customerName}`
                      : "Cliente nao vinculado"}
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
        </div>
      </div>
    </header>
  );
}
