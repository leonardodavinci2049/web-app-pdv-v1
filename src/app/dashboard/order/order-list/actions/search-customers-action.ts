"use server";

import { getAuthContext } from "@/server/auth-context";
import { getCustomers } from "@/services/api-main/customer-general/customer-general-cached-service";

export interface CustomerSearchResult {
  customerId: number;
  name: string;
  cpf: string;
  cnpj: string;
  customerType: string;
  personType: string;
}

export async function searchCustomersAction(
  search: string,
): Promise<CustomerSearchResult[]> {
  if (!search || search.trim().length < 3) {
    return [];
  }

  const { apiContext } = await getAuthContext();

  const customers = await getCustomers({
    search: search.trim(),
    qtRegistros: 20,
    ...apiContext,
  });

  return customers.map((c) => ({
    customerId: c.customerId,
    name: c.name,
    cpf: c.cpf,
    cnpj: c.cnpj,
    customerType: c.customerType,
    personType: c.personType,
  }));
}
