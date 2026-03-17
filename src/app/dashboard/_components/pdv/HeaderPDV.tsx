import { FileText, HelpCircle, SettingsIcon, User } from "lucide-react";
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
      return "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200";
    case 11:
      return "border-rose-200 bg-rose-100 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200";
    case 12:
      return "border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200";
    case 13:
      return "border-violet-200 bg-violet-100 text-violet-900 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-200";
    case 14:
      return "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200";
    case 17:
      return "border-teal-200 bg-teal-100 text-teal-900 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-200";
    default:
      return "border-border bg-muted text-foreground";
  }
}

export function HeaderPDV({ details }: HeaderPDVProps) {
  return (
    <header className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        {details ? (
          <>
            <div className="flex min-w-0 flex-col md:hidden">
              <span className="truncate text-sm font-semibold text-foreground">
                Pedido #{details.orderId}
              </span>
            </div>

            {details.orderStatus && (
              <Badge
                variant="outline"
                className={`max-w-36 truncate md:hidden ${getOrderStatusClassName(details.orderStatusId)}`}
              >
                {details.orderStatus}
              </Badge>
            )}

            <h2 className="hidden text-lg font-semibold text-foreground md:block">
              Sistema PDV
            </h2>

            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Pedido #{details.orderId}</span>
              {details.orderStatus && (
                <Badge
                  variant="outline"
                  className={getOrderStatusClassName(details.orderStatusId)}
                >
                  {details.orderStatus}
                </Badge>
              )}
              {details.orderDate && <span>{formatOrderDate(details.orderDate)}</span>}
            </div>
          </>
        ) : (
          <h2 className="text-lg font-semibold text-foreground">Sistema PDV</h2>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Vendedor</span>
        </div>

        <Button variant="ghost" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden md:inline">Orçamento</span>
        </Button>

        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
