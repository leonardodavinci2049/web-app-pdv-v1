import type { UIOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { BUDGET_FLOW_STEPS } from "../budget-flow";
import { CartItemsList } from "./cart-items-list";
import { MobileCartSheet } from "./mobile-cart-sheet";
import { ProductList } from "./product-list";
import { ProductSearchInput } from "./product-search-input";
import { StepNavigation } from "./step-navigation";

interface StepProductsProps {
  products: UIProductPdv[];
  orderDashboard: UIOrderDashboard | undefined;
  search: string;
  orderId?: number;
  customerId: number;
}

export function StepProducts({
  products,
  orderDashboard,
  search,
  orderId,
  customerId,
}: StepProductsProps) {
  const cartItems = orderDashboard?.items ?? [];
  const summary = orderDashboard?.summary;
  const hasOrder = Boolean(orderId);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
            Buscar produtos
          </h2>

          <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-background/50 px-3 py-1.5 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-primary/70 animate-pulse" />
            <p className="text-[11px] font-medium text-muted-foreground">
              {hasOrder
                ? `Pedido #${orderId} em edição`
                : "Pedido será criado no primeiro item"}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <ProductSearchInput
            defaultValue={search}
            orderId={orderId}
            customerId={customerId}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="space-y-1 px-1">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Produtos disponíveis
              </h3>
            </div>

            <ProductList
              products={products}
              orderId={orderId}
              customerId={customerId}
            />
          </div>
        </div>

        {/* Desktop cart sidebar - hidden on mobile */}
        <div className="hidden space-y-4 xl:block xl:sticky xl:top-4 xl:self-start">
          <CartItemsList
            items={cartItems}
            summary={summary}
            orderId={orderId}
            emptyMessage={
              hasOrder
                ? "Nenhum item adicionado."
                : "Selecione o primeiro produto para criar o orçamento e iniciar o carrinho."
            }
          />

          {orderId && (
            <StepNavigation
              nextStep={BUDGET_FLOW_STEPS.payment}
              orderId={orderId}
              customerId={customerId}
              disabled={cartItems.length === 0}
              nextLabel="Selecionar Pagamento"
            />
          )}
        </div>
      </div>

      {/* Mobile cart sheet with bottom bar */}
      <MobileCartSheet
        itemCount={cartItems.length}
        orderId={orderId}
        customerId={customerId}
        nextStep={BUDGET_FLOW_STEPS.payment}
        nextLabel="Selecionar Pagamento"
        disabled={cartItems.length === 0}
      >
        <CartItemsList
          items={cartItems}
          summary={summary}
          orderId={orderId}
          variant="mobile"
          emptyMessage={
            hasOrder
              ? "Nenhum item adicionado."
              : "Selecione o primeiro produto para criar o orçamento e iniciar o carrinho."
          }
        />
      </MobileCartSheet>
    </div>
  );
}
