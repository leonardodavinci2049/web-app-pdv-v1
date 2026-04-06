import { PencilLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { UIOrderDashboardDetails } from "@/services/api-main/order-sales/transformers/transformers";
import { OrderEditInlineFields } from "./order-edit-inline-fields";

interface OrderEditSectionProps {
  details: UIOrderDashboardDetails | null;
}

export function OrderEditSection({ details }: OrderEditSectionProps) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-border/70 bg-linear-to-b from-card via-card to-muted/40 p-0 shadow-xl shadow-black/10 dark:shadow-black/30">
      <div className="border-b border-border/60 px-5 py-1 md:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            <PencilLine className="h-3.5 w-3.5" />
            Edicao do Orçamento
          </div>
        </div>
      </div>

      <OrderEditInlineFields details={details} />
    </Card>
  );
}
