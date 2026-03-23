import type { UICustomerListItem } from "@/services/api-main/customer-general/transformers/transformers";
import { CustomerCreateDialog } from "./customer-create-dialog";
import { CustomerListCard } from "./customer-list-card";
import { CustomerSearchInput } from "./customer-search-input";

interface StepCustomerSelectProps {
  customers: UICustomerListItem[];
  search: string;
}

export function StepCustomerSelect({
  customers,
  search,
}: StepCustomerSelectProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
              Etapa 1
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Escolha o cliente do orçamento
              </h2>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Busque por nome, documento ou e-mail e siga para o carrinho
                quando encontrar a pessoa certa.
              </p>
            </div>
          </div>

          <CustomerCreateDialog />
        </div>
      </section>

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
        <CustomerSearchInput defaultValue={search} />

        {customers.length === 0 ? (
          <div className="mt-5 flex min-h-[240px] items-center justify-center rounded-[24px] border border-dashed border-border/70 bg-muted/15 px-6 text-center">
            <p className="max-w-md text-sm text-muted-foreground">
              {search
                ? "Nenhum cliente encontrado para essa busca. Tente outro termo ou cadastre um novo cliente."
                : "Digite para buscar um cliente e iniciar o fluxo do orçamento."}
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {customers.map((customer) => (
              <CustomerListCard key={customer.id} customer={customer} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
