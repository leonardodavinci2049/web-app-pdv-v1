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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Selecionar Cliente</h2>
        <CustomerCreateDialog />
      </div>

      <CustomerSearchInput defaultValue={search} />

      {customers.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            {search
              ? "Nenhum cliente encontrado para a busca."
              : "Digite para buscar um cliente."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {customers.map((customer) => (
            <CustomerListCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}
