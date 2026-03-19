function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPreviousMonthStart(referenceDate: Date): Date {
  return new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
}

function getTomorrow(referenceDate: Date): Date {
  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow;
}

export interface OrderListSearchParams {
  sellerId?: string;
  orderStatusId?: string;
  financialStatusId?: string;
  locationId?: string;
  initialDate?: string;
  finalDate?: string;
  limit?: string;
}

export interface OrderListFiltersValues {
  sellerId: string;
  orderStatusId: string;
  financialStatusId: string;
  locationId: string;
  initialDate: string;
  finalDate: string;
  limit: string;
}

export interface OrderListStatusOption {
  value: string;
  label: string;
}

export const DEFAULT_ORDER_LIST_ID = "0";
export const DEFAULT_ORDER_LIST_LIMIT = "20";

export function getDefaultOrderListFilters(
  referenceDate: Date = new Date(),
): OrderListFiltersValues {
  return {
    sellerId: DEFAULT_ORDER_LIST_ID,
    orderStatusId: DEFAULT_ORDER_LIST_ID,
    financialStatusId: DEFAULT_ORDER_LIST_ID,
    locationId: DEFAULT_ORDER_LIST_ID,
    initialDate: formatDateForInput(getPreviousMonthStart(referenceDate)),
    finalDate: formatDateForInput(getTomorrow(referenceDate)),
    limit: DEFAULT_ORDER_LIST_LIMIT,
  };
}

export function normalizeOrderListFilters(
  filters: Partial<OrderListSearchParams> = {},
  defaults: OrderListFiltersValues = getDefaultOrderListFilters(),
): OrderListFiltersValues {
  return {
    sellerId: filters.sellerId ?? defaults.sellerId,
    orderStatusId: filters.orderStatusId ?? defaults.orderStatusId,
    financialStatusId: filters.financialStatusId ?? defaults.financialStatusId,
    locationId: filters.locationId ?? defaults.locationId,
    initialDate: filters.initialDate ?? defaults.initialDate,
    finalDate: filters.finalDate ?? defaults.finalDate,
    limit: filters.limit ?? defaults.limit,
  };
}
