import type { UIOrderReportListItem } from "@/services/api-main/order-reports/transformers/transformers";
import { OrderCard } from "./order-card";
import { OrderEmptyState } from "./order-empty-state";

interface OrderListGridProps {
  orders: UIOrderReportListItem[];
  onClearFilters?: () => void;
}

export function OrderListGrid({ orders, onClearFilters }: OrderListGridProps) {
  if (orders.length === 0) {
    return <OrderEmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <OrderCard key={order.orderId} order={order} />
      ))}
    </div>
  );
}
