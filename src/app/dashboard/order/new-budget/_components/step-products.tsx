import type { UIOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { CartItemsList } from "./cart-items-list";
import { ProductList } from "./product-list";
import { ProductSearchInput } from "./product-search-input";
import { StepNavigation } from "./step-navigation";

interface StepProductsProps {
  products: UIProductPdv[];
  orderDashboard: UIOrderDashboard | undefined;
  search: string;
  orderId: number;
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

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Adicionar Produtos</h2>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <ProductSearchInput
            defaultValue={search}
            orderId={orderId}
            customerId={customerId}
          />
          <ProductList
            products={products}
            orderId={orderId}
            customerId={customerId}
            search={search}
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <CartItemsList items={cartItems} summary={summary} />
        </div>
      </div>

      <StepNavigation
        nextStep={4}
        orderId={orderId}
        customerId={customerId}
        disabled={cartItems.length === 0}
        nextLabel="Ir para Pagamento"
      />
    </div>
  );
}
