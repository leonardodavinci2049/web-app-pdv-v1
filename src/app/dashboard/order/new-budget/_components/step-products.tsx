import type { UIOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { BUDGET_FLOW_STEPS } from "../budget-flow";
import { CartItemsList } from "./cart-items-list";
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
      <section className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
              Etapa 2
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Monte o carrinho do orçamento
              </h2>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Pesquise os produtos, ajuste a quantidade antes de adicionar e
                edite o carrinho sem sair desta etapa.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Estado do pedido
            </p>
            <p className="text-sm font-semibold text-foreground">
              {hasOrder
                ? `Pedido #${orderId} em edição`
                : "Pedido será criado no primeiro item"}
            </p>
          </div>
        </div>

        {!hasOrder && (
          <div className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            O orçamento nasce automaticamente quando o primeiro produto entra no
            carrinho.
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <section className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
            <div className="space-y-1 pb-4">
              <h3 className="text-base font-semibold text-foreground">
                Buscar produtos
              </h3>
              <p className="text-sm text-muted-foreground">
                Procure por nome, referência, modelo ou etiqueta para acelerar o
                atendimento.
              </p>
            </div>

            <ProductSearchInput
              defaultValue={search}
              orderId={orderId}
              customerId={customerId}
            />
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
            <div className="space-y-1 pb-4">
              <h3 className="text-base font-semibold text-foreground">
                Produtos disponíveis
              </h3>
              <p className="text-sm text-muted-foreground">
                Os itens abaixo já respeitam o contexto do cliente e o estoque
                disponível para a venda.
              </p>
            </div>

            <ProductList
              products={products}
              orderId={orderId}
              customerId={customerId}
            />
          </section>
        </div>

        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
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
        </div>
      </div>

      {orderId && (
        <StepNavigation
          nextStep={BUDGET_FLOW_STEPS.payment}
          orderId={orderId}
          customerId={customerId}
          disabled={cartItems.length === 0}
          nextLabel="Ir para Pagamento"
        />
      )}
    </div>
  );
}
