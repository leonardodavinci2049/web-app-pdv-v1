"use client";

import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { UICustomerListItem } from "@/services/api-main/customer-general/transformers/transformers";
import { CustomerQuickViewDialog } from "./customer-quick-view-dialog";

interface CustomerListTableProps {
  customers: UICustomerListItem[];
}

function getCustomerDocument(customer: UICustomerListItem): string {
  return customer.personTypeId === 1
    ? formatCpf(customer.cpf)
    : formatCnpj(customer.cnpj);
}

function formatCpf(cpf: string): string {
  if (!cpf || cpf.length !== 11) return cpf || "-";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj || "-";
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatPhone(phone: string): string {
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

function formatDate(date: string | undefined): string {
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

export function CustomerListTable({ customers }: CustomerListTableProps) {
  const searchParams = useSearchParams();

  if (customers.length === 0) return null;

  const backUrl = searchParams.toString()
    ? `/dashboard/customer/customer-list?${searchParams.toString()}`
    : "/dashboard/customer/customer-list";
  const editHref = (id: number) =>
    `/dashboard/customer/${id}?back=${encodeURIComponent(backUrl)}`;

  return (
    <>
      <div className="grid gap-4 p-3 sm:p-4 md:hidden">
        {customers.map((customer) => (
          <article
            key={customer.customerId}
            className="group min-w-0 overflow-hidden rounded-xl border border-border/80 bg-neutral-50 p-4 shadow-sm transition-all hover:border-primary/30 hover:bg-neutral-100 hover:shadow-md dark:border-border/80 dark:bg-neutral-900/50 dark:hover:bg-neutral-900/80"
          >
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 rounded-full border border-border/40 bg-background px-2 py-0.5 font-mono text-[10px] shadow-sm text-muted-foreground">
                  #{customer.customerId}
                </span>
                <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                  {customer.name}
                </p>
              </div>

              <div className="mt-0.5 flex items-center gap-x-2 overflow-hidden text-xs text-muted-foreground">
                {customer.customerType && (
                  <span className="min-w-0 truncate">
                    {customer.customerType}
                  </span>
                )}
                {customer.customerType && customer.personType && (
                  <span className="shrink-0 text-border">·</span>
                )}
                {customer.personType && (
                  <span className="min-w-0 truncate">
                    {customer.personType}
                  </span>
                )}
              </div>

              {customer.companyName && (
                <p className="mt-1 truncate text-xs text-muted-foreground/90">
                  {customer.companyName}
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="max-w-full truncate rounded-full border border-border/40 bg-background px-2 py-1 shadow-sm">
                {formatPhone(customer.phone)}
              </span>
              {customer.whatsapp && customer.whatsapp !== customer.phone && (
                <span className="max-w-full truncate rounded-full border border-emerald-500/20 bg-emerald-50 px-2 py-1 text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400">
                  WA {formatPhone(customer.whatsapp)}
                </span>
              )}
            </div>

            <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="max-w-full truncate rounded-full border border-border/40 bg-background px-2 py-1 font-mono shadow-sm">
                  {getCustomerDocument(customer)}
                </span>
                <span className="rounded-full border border-border/40 bg-background px-2 py-1 shadow-sm">
                  {formatDate(customer.lastPurchase)}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <CustomerQuickViewDialog
                  customer={customer}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-full border border-border/40 bg-background text-muted-foreground shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                      title="Visualização rápida"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full border border-border/40 bg-background text-muted-foreground shadow-sm hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400"
                  title="Editar cliente"
                >
                  <Link href={editHref(customer.customerId)}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">#ID</TableHead>
              <TableHead className="w-[300px]">Cliente</TableHead>
              <TableHead className="w-[150px]">Documento</TableHead>
              <TableHead className="w-[180px]">Telefone/WhatsApp</TableHead>
              <TableHead className="w-[120px]">Tipo Pessoa</TableHead>
              <TableHead className="w-[150px]">Tipo Cliente</TableHead>
              <TableHead className="w-[120px]">Última Compra</TableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customerId}>
                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">
                    {customer.customerId}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">
                      {customer.name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">
                    {getCustomerDocument(customer)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm">{formatPhone(customer.phone)}</p>
                    {customer.whatsapp &&
                      customer.whatsapp !== customer.phone && (
                        <p className="text-xs text-muted-foreground">
                          WA: {formatPhone(customer.whatsapp)}
                        </p>
                      )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      customer.personTypeId === 1
                        ? "border-violet-500/30 bg-violet-500/5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                        : "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                    )}
                  >
                    {customer.personType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {customer.customerType}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(customer.lastPurchase)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <CustomerQuickViewDialog
                      customer={customer}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Visualização rápida"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
                      title="Editar cliente"
                    >
                      <Link href={editHref(customer.customerId)}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
