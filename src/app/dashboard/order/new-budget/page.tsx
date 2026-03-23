import { getAuthContext } from "@/server/auth-context";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { getCustomers } from "@/services/api-main/customer-general/customer-general-cached-service";
import { getOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";
import { searchProductsPdv } from "@/services/api-main/product-pdv/product-pdv-cached-service";

import { BudgetStepper } from "./_components/budget-stepper";
import { StepCustomerSelect } from "./_components/step-customer-select";
import { StepPayment } from "./_components/step-payment";
import { StepProducts } from "./_components/step-products";
import { StepSummary } from "./_components/step-summary";
import { BUDGET_FLOW_STEPS, normalizeBudgetStep } from "./budget-flow";

interface NewBudgetPageProps {
  searchParams: Promise<{
    step?: string;
    search?: string;
    customerId?: string;
    orderId?: string;
  }>;
}

export default async function NewBudgetPage({
  searchParams,
}: NewBudgetPageProps) {
  const { apiContext } = await getAuthContext();
  const dashboardParams = {
    ...apiContext,
    sellerId: apiContext.pe_person_id,
    typeBusiness: 1,
  };

  const params = await searchParams;
  const step = normalizeBudgetStep(Number(params.step));
  const search = params.search ?? "";
  const customerId = params.customerId ? Number(params.customerId) : undefined;
  const orderId = params.orderId ? Number(params.orderId) : undefined;

  let customers: Awaited<ReturnType<typeof getCustomers>> = [];
  let products: Awaited<ReturnType<typeof searchProductsPdv>> = [];
  let orderDashboard: Awaited<ReturnType<typeof getOrderDashboard>>;

  if (step === BUDGET_FLOW_STEPS.customer) {
    customers = await getCustomers({
      search,
      qtRegistros: 50,
      ...apiContext,
    });
  }

  if (step === BUDGET_FLOW_STEPS.cart && customerId) {
    products = await searchProductsPdv({
      search: search || undefined,
      customerId,
      flagStock: 1,
      limit: search ? 50 : 20,
      ...apiContext,
    });

    if (orderId) {
      orderDashboard = await getOrderDashboard(orderId, dashboardParams);
    }
  }

  if (step === BUDGET_FLOW_STEPS.payment && orderId) {
    orderDashboard = await getOrderDashboard(orderId, dashboardParams);
  }

  if (step === BUDGET_FLOW_STEPS.summary && orderId) {
    orderDashboard = await getOrderDashboard(orderId, dashboardParams);
  }

  const effectiveCustomerId =
    customerId ?? orderDashboard?.customer?.customerId;

  return (
    <div className="flex flex-1 flex-col">

      <SiteHeaderWithBreadcrumb
        title="Novo Orçamento"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Vendas", href: "#" },
          { label: "Novo Orçamento", isActive: true },
        ]}
      />



      <main className="flex flex-1 flex-col gap-6 p-4 pt-0 lg:p-6 lg:pt-0">
        <div className="mx-auto flex w-full max-w-350 flex-col gap-6">
          <BudgetStepper
            currentStep={step}
            customerId={effectiveCustomerId}
            orderId={orderId}
          >
            {step === BUDGET_FLOW_STEPS.customer && (
              <StepCustomerSelect customers={customers} search={search} />
            )}

            {step === BUDGET_FLOW_STEPS.cart && effectiveCustomerId && (
              <StepProducts
                products={products}
                orderDashboard={orderDashboard}
                search={search}
                orderId={orderId}
                customerId={effectiveCustomerId}
              />
            )}

            {step === BUDGET_FLOW_STEPS.payment && orderId && (
              <StepPayment
                orderDashboard={orderDashboard}
                orderId={orderId}
                customerId={effectiveCustomerId}
              />
            )}

            {step === BUDGET_FLOW_STEPS.summary && orderId && (
              <StepSummary orderDashboard={orderDashboard} orderId={orderId} />
            )}
          </BudgetStepper>
        </div>
      </main>
    </div>
  );
}
