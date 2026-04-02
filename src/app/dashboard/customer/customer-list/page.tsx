import { Plus } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { getAuthContext } from "@/server/auth-context";
import { getCustomers } from "@/services/api-main/customer-general/customer-general-cached-service";
import { CustomerListEmptyState } from "./_components/customer-list-empty-state";
import { CustomerListFilter } from "./_components/customer-list-filter";
import { CustomerListTable } from "./_components/customer-list-table";

interface CustomerListPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function CustomerListPage({
  searchParams,
}: CustomerListPageProps) {
  await connection();

  const { apiContext } = await getAuthContext();
  const params = await searchParams;
  const search = params.search || "";

  const customers = await getCustomers({
    search,
    qtRegistros: 50,
    pageId: 0,
    columnId: 1,
    orderId: 1,
    ...apiContext,
  });

  const hasCustomers = customers.length > 0;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Relatório de Clientes"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clientes", isActive: true },
        ]}
      />

      <div className="flex flex-1 flex-col">
        <div className="@container/main mx-auto w-full max-w-[1400px] flex-1 flex-col gap-6 px-4 lg:px-6 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Clientes</h2>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/customer/add-customer">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Novo Cliente</span>
                  <span className="sm:hidden">Novo</span>
                </Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:rounded-[28px] sm:p-5">
              <CustomerListFilter />
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-sm sm:rounded-[28px]">
              {hasCustomers ? (
                <CustomerListTable customers={customers} />
              ) : (
                <div className="p-6">
                  <CustomerListEmptyState hasSearch={search.length > 0} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
