import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getOrderDashboard,
  type UIOrderDashboard,
} from "@/services/api-main/order-sales/order-sales-cached-service";
import { CustomerSection } from "./_components/customer-section";
import { HeaderOrderSection } from "./_components/header-order-section";
import { OrderItemsSection } from "./_components/order-items-section";
import { OrderSummarySection } from "./_components/order-summary-section";

const logger = createLogger("dashboard-pdv-page");

interface PdvPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function SalesPanelPage({ searchParams }: PdvPageProps) {
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
        title="PDV"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "PDV", isActive: true },
        ]}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 pb-6 pt-4 md:px-6 md:pb-8">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(360px,420px)] xl:grid-cols-[minmax(0,2fr)_minmax(380px,450px)]">
              <main className="flex min-w-0 flex-col gap-4 order-1">
                <HeaderOrderSection details={dashboardData?.details ?? null} />
                <CustomerSection customer={dashboardData?.customer ?? null} />
                <OrderItemsSection items={dashboardData?.items ?? []} />
              </main>

              <aside className="min-w-0 order-2">
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
