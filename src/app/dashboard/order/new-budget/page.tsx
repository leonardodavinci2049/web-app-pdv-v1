import { getAuthContext } from "@/server/auth-context";
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
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 lg:p-6 lg:pt-0">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-br from-background via-background to-muted/50 shadow-sm">
          <div className="flex flex-col gap-4 px-5 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
                Fluxo de Orçamento
              </p>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Novo orçamento com carrinho operacional
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                  Selecione o cliente, monte o carrinho com ajustes em tempo
                  real, defina o pagamento e finalize com uma visão clara do
                  resumo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-2xl border border-border/60 bg-background/85 px-4 py-3 shadow-xs">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Etapas
                </p>
                <p className="text-2xl font-semibold text-foreground">4</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/85 px-4 py-3 shadow-xs">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Fluxo atual
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {step}/4
                </p>
              </div>
            </div>
          </div>
        </section>

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
    </div>
  );
}
