import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getOrderDashboard,
  type UIOrderDashboard,
} from "@/services/api-main/order-sales/order-sales-cached-service";
import { SiteHeaderWithBreadcrumb } from "./_components/header/site-header-with-breadcrumb";
import { CustomerSection } from "./_components/pdv/customer-section";
import { HeaderOrderSection } from "./_components/pdv/header-order-section";
import { OrderItemsSection } from "./_components/pdv/order-items-section";
import { OrderSummarySection } from "./_components/pdv/order-summary-section";

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
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-primary/10 via-background to-transparent" />

      <SiteHeaderWithBreadcrumb
        title="Vendas"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pedidos", isActive: true },
        ]}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 pb-6 pt-4 md:px-6 md:pb-8">
            <HeaderOrderSection details={dashboardData?.details ?? null} />

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,420px)]">
              <main className="flex min-w-0 flex-col gap-4">
                <CustomerSection customer={dashboardData?.customer ?? null} />
                <OrderItemsSection items={dashboardData?.items ?? []} />
              </main>

              <aside className="min-w-0">
                <div className="xl:sticky xl:top-4">
                  <OrderSummarySection
                    summary={dashboardData?.summary ?? null}
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
