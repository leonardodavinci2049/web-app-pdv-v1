import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getCustomerById,
  getCustomers,
} from "@/services/api-main/customer-general/customer-general-cached-service";
import { getOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";
import { searchProductsPdv } from "@/services/api-main/product-pdv/product-pdv-cached-service";

const logger = createLogger("new-budget-page");

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
    flagStock?: string;
    limit?: string;
    customerLimit?: string;
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
  const flagStock = params.flagStock === "0" ? 0 : 1;
  const DEFAULT_PRODUCT_LIMIT = 20;
  const productLimit = params.limit
    ? Math.max(DEFAULT_PRODUCT_LIMIT, Number(params.limit))
    : DEFAULT_PRODUCT_LIMIT;
  const DEFAULT_CUSTOMER_LIMIT = 50;
  const customerLimit = params.customerLimit
    ? Math.max(DEFAULT_CUSTOMER_LIMIT, Number(params.customerLimit))
    : DEFAULT_CUSTOMER_LIMIT;

  let customers: Awaited<ReturnType<typeof getCustomers>> = [];
  let products: Awaited<ReturnType<typeof searchProductsPdv>> = [];
  let orderDashboard: Awaited<ReturnType<typeof getOrderDashboard>>;

  if (step === BUDGET_FLOW_STEPS.customer) {
    customers = await getCustomers({
      search,
      qtRegistros: customerLimit,
      ...apiContext,
    });
  }

  if (step === BUDGET_FLOW_STEPS.cart && customerId) {
    products = await searchProductsPdv({
      search: search || undefined,
      customerId,
      flagStock,
      limit: search ? Math.max(50, productLimit) : productLimit,
      ...apiContext,
    });

    if (orderId) {
      try {
        orderDashboard = await getOrderDashboard(orderId, dashboardParams);
      } catch (error) {
        logger.error("Erro ao carregar dashboard do pedido (cart):", error);
      }
    }
  }

  if (step === BUDGET_FLOW_STEPS.payment && orderId) {
    try {
      orderDashboard = await getOrderDashboard(orderId, dashboardParams);
    } catch (error) {
      logger.error("Erro ao carregar dashboard do pedido (payment):", error);
    }
  }

  if (step === BUDGET_FLOW_STEPS.summary && orderId) {
    try {
      orderDashboard = await getOrderDashboard(orderId, dashboardParams);
    } catch (error) {
      logger.error("Erro ao carregar dashboard do pedido (summary):", error);
    }
  }

  const effectiveCustomerId =
    customerId ?? orderDashboard?.customer?.customerId;

  let customerName: string | undefined;
  if (effectiveCustomerId && step >= BUDGET_FLOW_STEPS.cart) {
    if (orderDashboard?.customer?.customerName) {
      customerName = orderDashboard.customer.customerName;
    } else {
      const customerData = await getCustomerById(
        effectiveCustomerId,
        apiContext,
      );
      customerName = customerData?.customer.name;
    }
  }

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
            customerName={customerName}
            orderId={orderId}
          >
            {step === BUDGET_FLOW_STEPS.customer && (
              <StepCustomerSelect
                customers={customers}
                search={search}
                customerLimit={customerLimit}
              />
            )}

            {step === BUDGET_FLOW_STEPS.cart && effectiveCustomerId && (
              <StepProducts
                products={products}
                orderDashboard={orderDashboard}
                search={search}
                orderId={orderId}
                customerId={effectiveCustomerId}
                flagStock={flagStock}
                productLimit={productLimit}
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
