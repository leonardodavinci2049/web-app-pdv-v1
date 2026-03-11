import { FileText, HelpCircle, SettingsIcon, User } from "lucide-react";
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

export function HeaderPDV({ details }: HeaderPDVProps) {
  return (
    <header className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">Sistema PDV</h2>
        {details && (
          <span className="hidden md:inline text-sm text-muted-foreground">
            Pedido #{details.orderId}
            {details.orderDate && ` — ${formatOrderDate(details.orderDate)}`}
          </span>
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
