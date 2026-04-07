import type { UICustomerListItem } from "@/services/api-main/customer-general/transformers/transformers";

export function getCustomerDocument(customer: UICustomerListItem): string {
  return customer.personTypeId === 1
    ? formatCpf(customer.cpf)
    : formatCnpj(customer.cnpj);
}

export function formatCpf(cpf: string): string {
  if (!cpf || cpf.length !== 11) return cpf || "-";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj || "-";
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatPhone(phone: string): string {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

export function formatDate(date: string | undefined): string {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "-";
  }
}
