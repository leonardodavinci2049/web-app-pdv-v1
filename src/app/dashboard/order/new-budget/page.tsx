import { getAuthContext } from "@/server/auth-context";
import { getCustomers } from "@/services/api-main/customer-general/customer-general-cached-service";
import { getOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";
import { searchProductsPdv } from "@/services/api-main/product-pdv/product-pdv-cached-service";

import { BudgetStepper } from "./_components/budget-stepper";
import { StepCustomerSelect } from "./_components/step-customer-select";
import { StepPayment } from "./_components/step-payment";
import { StepProducts } from "./_components/step-products";
import { StepSummary } from "./_components/step-summary";

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
  const step = Number(params.step) || 1;
  const search = params.search ?? "";
  const customerId = params.customerId ? Number(params.customerId) : undefined;
  const orderId = params.orderId ? Number(params.orderId) : undefined;

  let customers: Awaited<ReturnType<typeof getCustomers>> = [];
  let products: Awaited<ReturnType<typeof searchProductsPdv>> = [];
  let orderDashboard: Awaited<ReturnType<typeof getOrderDashboard>>;

  if (step === 1) {
    customers = await getCustomers({
      search,
      qtRegistros: 50,
      ...apiContext,
    });
  }

  if (step === 3 && customerId) {
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

  if (step === 4 && orderId) {
    orderDashboard = await getOrderDashboard(orderId, dashboardParams);
  }

  if (step === 5 && orderId) {
    orderDashboard = await getOrderDashboard(orderId, dashboardParams);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">Novo Orçamento</h1>

        <BudgetStepper
          currentStep={step}
          customerId={customerId}
          orderId={orderId}
        >
          {step === 1 && (
            <StepCustomerSelect customers={customers} search={search} />
          )}

          {step === 3 && customerId && (
            <StepProducts
              products={products}
              orderDashboard={orderDashboard}
              search={search}
              orderId={orderId}
              customerId={customerId}
            />
          )}

          {step === 4 && orderId && (
            <StepPayment orderDashboard={orderDashboard} orderId={orderId} />
          )}

          {step === 5 && orderId && (
            <StepSummary orderDashboard={orderDashboard} orderId={orderId} />
          )}
        </BudgetStepper>
      </div>
    </div>
  );
}
