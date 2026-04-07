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
import {
  formatDate,
  formatPhone,
  getCustomerDocument,
} from "./customer-list-formatters";
import { CustomerListMobileCard } from "./customer-list-mobile-card";
import { CustomerQuickViewDialog } from "./customer-quick-view-dialog";

interface CustomerListTableProps {
  customers: UICustomerListItem[];
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
          <CustomerListMobileCard
            key={customer.customerId}
            customer={customer}
            editHref={editHref(customer.customerId)}
          />
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
