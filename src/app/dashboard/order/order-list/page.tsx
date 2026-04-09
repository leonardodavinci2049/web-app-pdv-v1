import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getSaleOrders } from "@/services/api-main/order-reports/order-reports-cached-service";
import { OrderListContent } from "./_components/order-list-content";
import {
  DEFAULT_ORDER_LIST_LIMIT,
  getDefaultOrderListFilters,
  normalizeOrderListFilters,
  type OrderListSearchParams,
} from "./order-list.types";

interface OrderListPageProps {
  searchParams: Promise<OrderListSearchParams>;
}

const logger = createLogger("order-list-page");

function toOptionalNumber(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

export default async function OrderListPage(props: OrderListPageProps) {
  await connection();

  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();
  const defaultFilters = getDefaultOrderListFilters();
  const currentFilters = normalizeOrderListFilters(
    searchParams,
    defaultFilters,
  );

  let orders: Awaited<ReturnType<typeof getSaleOrders>> = [];

  try {
    orders = await getSaleOrders({
      orderId: toOptionalNumber(currentFilters.orderId),
      customerId: toOptionalNumber(currentFilters.customerId),
      sellerId: apiContext.pe_person_id,
      orderStatusId: toOptionalNumber(currentFilters.orderStatusId),
      financialStatusId: toOptionalNumber(currentFilters.financialStatusId),
      locationId: toOptionalNumber(currentFilters.locationId),
      initialDate: currentFilters.initialDate,
      finalDate: currentFilters.finalDate,
      limit:
        toOptionalNumber(currentFilters.limit) ??
        Number(DEFAULT_ORDER_LIST_LIMIT),
      ...apiContext,
    });
  } catch (error) {
    logger.error("Erro ao carregar pedidos de venda:", error);
  }

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Listagem de Pedidos"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pedidos", href: "#" },
          { label: "Listagem de Pedidos", isActive: true },
        ]}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="@container/main mx-auto w-full max-w-[1400px] flex-1 flex-col gap-6 px-4 lg:px-6 py-6 overflow-hidden">
          <OrderListContent
            orders={orders}
            currentFilters={currentFilters}
            defaultFilters={defaultFilters}
          />
        </div>
      </div>
    </>
  );
}
