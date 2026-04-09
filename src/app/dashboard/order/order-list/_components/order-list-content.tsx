"use client";

import { LoaderCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { UIOrderReportListItem } from "@/services/api-main/order-reports/transformers/transformers";
import {
  DEFAULT_ORDER_LIST_ID,
  DEFAULT_ORDER_LIST_LIMIT,
  normalizeOrderListFilters,
  type OrderListFiltersValues,
  type OrderListSearchParams,
  type OrderListStatusOption,
} from "../order-list.types";
import { OrderListFilters } from "./order-list-filters";
import { OrderListGrid } from "./order-list-grid";

interface OrderListContentProps {
  orders: UIOrderReportListItem[];
  currentFilters: OrderListSearchParams;
  defaultFilters: OrderListFiltersValues;
}

function getFiltersFromSearchParams(
  searchParams: ReturnType<typeof useSearchParams>,
  defaultFilters: OrderListFiltersValues,
): OrderListFiltersValues {
  return normalizeOrderListFilters(
    {
      orderId: searchParams.get("orderId") ?? undefined,
      customerId: searchParams.get("customerId") ?? undefined,
      sellerId: searchParams.get("sellerId") ?? undefined,
      orderStatusId: searchParams.get("orderStatusId") ?? undefined,
      financialStatusId: searchParams.get("financialStatusId") ?? undefined,
      locationId: searchParams.get("locationId") ?? undefined,
      initialDate: searchParams.get("initialDate") ?? undefined,
      finalDate: searchParams.get("finalDate") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    },
    defaultFilters,
  );
}

function buildStatusOptions(
  orders: UIOrderReportListItem[],
  type: "order" | "financial",
  selectedValue: string,
): OrderListStatusOption[] {
  const optionsMap = new Map<string, string>();

  for (const order of orders) {
    const value =
      type === "order"
        ? String(order.orderStatusId || "")
        : String(order.financialStatusId || "");
    const label = type === "order" ? order.orderStatus : order.financialStatus;

    if (value && label) {
      optionsMap.set(value, label);
    }
  }

  if (
    selectedValue !== DEFAULT_ORDER_LIST_ID &&
    !optionsMap.has(selectedValue)
  ) {
    optionsMap.set(selectedValue, `ID ${selectedValue}`);
  }

  return Array.from(optionsMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
}

function countActiveFilters(
  filters: OrderListFiltersValues,
  defaultFilters: OrderListFiltersValues,
): number {
  return [
    filters.orderId !== defaultFilters.orderId ? filters.orderId : "",
    filters.customerId !== defaultFilters.customerId ? filters.customerId : "",
    filters.sellerId !== defaultFilters.sellerId ? filters.sellerId : "",
    filters.orderStatusId !== defaultFilters.orderStatusId
      ? filters.orderStatusId
      : "",
    filters.financialStatusId !== defaultFilters.financialStatusId
      ? filters.financialStatusId
      : "",
    filters.locationId !== defaultFilters.locationId ? filters.locationId : "",
    filters.initialDate !== defaultFilters.initialDate
      ? filters.initialDate
      : "",
    filters.finalDate !== defaultFilters.finalDate ? filters.finalDate : "",
    filters.limit !== DEFAULT_ORDER_LIST_LIMIT ? filters.limit : "",
  ].filter(Boolean).length;
}

export function OrderListContent({
  orders,
  currentFilters,
  defaultFilters,
}: OrderListContentProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<OrderListFiltersValues>(() =>
    normalizeOrderListFilters(currentFilters, defaultFilters),
  );

  useEffect(() => {
    setFilters(getFiltersFromSearchParams(searchParams, defaultFilters));
  }, [searchParams, defaultFilters]);

  const orderStatusOptions = buildStatusOptions(
    orders,
    "order",
    filters.orderStatusId,
  );
  const financialStatusOptions = buildStatusOptions(
    orders,
    "financial",
    filters.financialStatusId,
  );
  const activeFiltersCount = countActiveFilters(filters, defaultFilters);

  const updateFilters = (nextFilters: OrderListFiltersValues) => {
    const params = new URLSearchParams();

    if (nextFilters.orderId !== defaultFilters.orderId) {
      params.set("orderId", nextFilters.orderId);
    }

    if (nextFilters.customerId !== defaultFilters.customerId) {
      params.set("customerId", nextFilters.customerId);
    }

    if (nextFilters.sellerId !== defaultFilters.sellerId) {
      params.set("sellerId", nextFilters.sellerId);
    }

    if (nextFilters.orderStatusId !== defaultFilters.orderStatusId) {
      params.set("orderStatusId", nextFilters.orderStatusId);
    }

    if (nextFilters.financialStatusId !== defaultFilters.financialStatusId) {
      params.set("financialStatusId", nextFilters.financialStatusId);
    }

    if (nextFilters.locationId !== defaultFilters.locationId) {
      params.set("locationId", nextFilters.locationId);
    }

    if (nextFilters.initialDate !== defaultFilters.initialDate) {
      params.set("initialDate", nextFilters.initialDate);
    }

    if (nextFilters.finalDate !== defaultFilters.finalDate) {
      params.set("finalDate", nextFilters.finalDate);
    }

    if (nextFilters.limit !== defaultFilters.limit) {
      params.set("limit", nextFilters.limit);
    }

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  const handleFilterChange = (
    field: keyof OrderListFiltersValues,
    value: string,
  ) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    updateFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);

    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2 py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Listagem de pedidos
            </h1>
          </div>

          <div className="shrink-0 whitespace-nowrap rounded-lg border border-border/70 bg-card px-3 py-1.5 text-xs font-medium shadow-sm">
            {orders.length} pedido{orders.length === 1 ? "" : "s"}
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex justify-end">
            <div className="whitespace-nowrap rounded-lg border border-border/70 bg-card px-3 py-1.5 text-xs font-medium shadow-sm">
              {activeFiltersCount} filtro{activeFiltersCount === 1 ? "" : "s"}{" "}
              ativo{activeFiltersCount === 1 ? "" : "s"}
            </div>
          </div>
        )}
      </section>

      <OrderListFilters
        filters={filters}
        orderStatusOptions={orderStatusOptions}
        financialStatusOptions={financialStatusOptions}
        activeFiltersCount={activeFiltersCount}
        isLoading={isPending}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <section aria-live="polite" className="space-y-4">
        {isPending && (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/90 px-4 py-3 text-sm shadow-sm">
            <LoaderCircle className="size-4 animate-spin text-primary" />
            Atualizando listagem de pedidos...
          </div>
        )}

        <div
          className={
            isPending ? "opacity-60 transition-opacity" : "transition-opacity"
          }
        >
          <OrderListGrid orders={orders} onClearFilters={handleClearFilters} />
        </div>
      </section>
    </div>
  );
}
