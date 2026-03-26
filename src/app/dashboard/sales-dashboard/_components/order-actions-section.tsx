import { Card, CardContent } from "@/components/ui/card";
import type {
  UIOrderCustomer,
  UIOrderDashboardDetails,
  UIOrderDashboardItem,
  UIOrderSalesSummary,
} from "@/services/api-main/order-sales/transformers/transformers";
import { FinalizeSaleButton } from "./finalize-sale-button";
import { PrintOrderButton } from "./print-order-button";
import { SendWhatsAppButton } from "./send-whatsapp-button";

interface OrderActionsSectionProps {
  summary: UIOrderSalesSummary | null;
  details: UIOrderDashboardDetails | null;
  items: UIOrderDashboardItem[];
  customer: UIOrderCustomer | null;
  orderStatusId: number;
}

export function OrderActionsSection({
  summary,
  details,
  items,
  customer,
  orderStatusId,
}: OrderActionsSectionProps) {
  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardContent className="space-y-3 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <PrintOrderButton
            summary={summary}
            details={details}
            items={items}
            customer={customer}
          />
          <SendWhatsAppButton
            summary={summary}
            details={details}
            items={items}
            customer={customer}
          />
        </div>
        <FinalizeSaleButton
          orderId={summary?.orderId ?? 0}
          orderStatusId={orderStatusId}
        />
      </CardContent>
    </Card>
  );
}
