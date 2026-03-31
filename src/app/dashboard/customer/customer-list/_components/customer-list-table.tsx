"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
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

interface CustomerListTableProps {
  customers: UICustomerListItem[];
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
  if (customers.length === 0) return null;

  return (
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
          <TableHead className="w-[100px] text-right">Ações</TableHead>
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
                <p className="font-medium text-foreground">{customer.name}</p>
                {customer.companyName && (
                  <p className="text-xs text-muted-foreground">
                    {customer.companyName}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono text-sm text-muted-foreground">
                {customer.personTypeId === 1
                  ? formatCpf(customer.cpf)
                  : formatCnpj(customer.cnpj)}
              </span>
            </TableCell>
            <TableCell>
              <div className="space-y-0.5">
                <p className="text-sm">{formatPhone(customer.phone)}</p>
                {customer.whatsapp && customer.whatsapp !== customer.phone && (
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
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Ver detalhes"
              >
                <Link href={`/dashboard/customer/${customer.customerId}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
