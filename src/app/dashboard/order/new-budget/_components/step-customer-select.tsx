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
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
            Buscar Cliente
          </p>
          <CustomerCreateDialog />
        </div>

        <div className="mt-4">
          <div className="w-full max-w-[400px]">
            <CustomerSearchInput defaultValue={search} />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-3 shadow-sm sm:p-5">
        {customers.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[24px] border border-dashed border-border/70 bg-muted/15 px-6 text-center">
            <p className="max-w-md text-sm text-muted-foreground">
              {search
                ? "Nenhum cliente encontrado para essa busca. Tente outro termo ou cadastre um novo cliente."
                : "Digite para buscar um cliente e iniciar o fluxo do orçamento."}
            </p>
          </div>
        ) : (
          <div className="mt-3 grid gap-2.5 sm:gap-3 xl:grid-cols-2">
            {customers.map((customer) => (
              <CustomerListCard key={customer.customerId} customer={customer} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
