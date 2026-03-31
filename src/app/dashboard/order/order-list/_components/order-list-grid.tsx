import type { UIOrderReportListItem } from "@/services/api-main/order-reports/transformers/transformers";
import { OrderEmptyState } from "./order-empty-state";
import { OrderTable } from "./order-table";

interface OrderListGridProps {
  orders: UIOrderReportListItem[];
  onClearFilters?: () => void;
}

export function OrderListGrid({ orders, onClearFilters }: OrderListGridProps) {
  if (orders.length === 0) {
    return <OrderEmptyState onClearFilters={onClearFilters} />;
  }

  return <OrderTable orders={orders} />;
}
