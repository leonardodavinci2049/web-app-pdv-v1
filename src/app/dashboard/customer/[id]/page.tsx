import { notFound } from "next/navigation";
import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { Card } from "@/components/ui/card";
import { getAuthContext } from "@/server/auth-context";
import { getCustomerById } from "@/services/api-main/customer-general/customer-general-cached-service";
import { CustomerDetailHeader } from "./_components/customer-detail-header";
import { CustomerDetailSections } from "./_components/customer-detail-sections";
import { CustomerSellerCard } from "./_components/customer-seller-card";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { apiContext } = await getAuthContext();
  const resolvedParams = await params;
  const customerId = Number(resolvedParams.id);

  if (Number.isNaN(customerId)) {
    notFound();
  }

  const result = await getCustomerById(customerId, apiContext);

  if (!result) {
    notFound();
  }

  const { customer, seller } = result;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do Cliente"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clientes", href: "/dashboard/customer/customer-list" },
          { label: "Detalhes", isActive: true },
        ]}
      />

      <div className="flex flex-1 flex-col">
        <div className="@container/main mx-auto w-full max-w-[1400px] flex-1 flex-col gap-6 px-4 lg:px-6 py-6">
          <CustomerDetailHeader customer={customer} />

          <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
            <CustomerDetailSections customer={customer} />

            <div className="space-y-6">
              {seller && <CustomerSellerCard seller={seller} />}

              <Card className="rounded-2xl border-border/70 bg-background/75 p-6 shadow-sm dark:bg-white/[0.03]">
                <div className="mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Ações Rápidas
                  </p>
                </div>

                <div className="space-y-3">
                  <a
                    href={`/dashboard/customer/customer-list`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-primary/5 hover:border-primary/20"
                  >
                    Ver Todos os Clientes
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
