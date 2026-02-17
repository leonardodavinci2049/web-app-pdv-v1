import { SiteHeaderWithBreadcrumb } from "./_components/header/site-header-with-breadcrumb";
import { CustomerSection } from "./_components/pdv/customer-section";
import { HeaderPDV } from "./_components/pdv/HeaderPDV";

import { OrderItemsSection } from "./_components/pdv/order-items-section";
import { OrderSummary } from "./_components/pdv/order-summary";

export default function DashboardPage() {
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
        <HeaderPDV />

        <div className="flex flex-1 flex-col md:flex-row gap-4 p-4 overflow-auto">
          <main className="flex-1 flex flex-col gap-4">
            <CustomerSection />
            <OrderItemsSection />
          </main>

          <aside className="w-full md:w-96 shrink-0">
            <OrderSummary />
          </aside>
        </div>
      </div>
    </div>
  );
}
