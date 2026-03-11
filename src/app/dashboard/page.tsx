import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getOrderDashboard,
  type UIOrderDashboard,
} from "@/services/api-main/order-sales/order-sales-cached-service";
import { SiteHeaderWithBreadcrumb } from "./_components/header/site-header-with-breadcrumb";
import { CustomerSection } from "./_components/pdv/customer-section";
import { HeaderPDV } from "./_components/pdv/HeaderPDV";
import { OrderItemsSection } from "./_components/pdv/order-items-section";
import { OrderSummary } from "./_components/pdv/order-summary";

const logger = createLogger("dashboard-page");

interface DashboardPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const orderId = params.orderId ? Number(params.orderId) : 0;

  let dashboardData: UIOrderDashboard | null = null;
  try {
    const { apiContext } = await getAuthContext();
    dashboardData =
      (await getOrderDashboard(orderId, {
        ...apiContext,
        sellerId: 2,
        typeBusiness: 1,
      })) ?? null;
  } catch (error) {
    logger.error("Erro ao carregar dados do pedido:", error);
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header fixo no topo */}
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Analytics", isActive: true },
        ]}
      />

      {/* Conteúdo com scroll */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderPDV details={dashboardData?.details ?? null} />

        <div className="flex flex-1 flex-col md:flex-row gap-4 p-4 overflow-auto">
          <main className="flex-1 flex flex-col gap-4">
            <CustomerSection customer={dashboardData?.customer ?? null} />
            <OrderItemsSection items={dashboardData?.items ?? []} />
          </main>

          <aside className="w-full md:w-96 shrink-0">
            <OrderSummary summary={dashboardData?.summary ?? null} />
          </aside>
        </div>
      </div>
    </div>
  );
}
