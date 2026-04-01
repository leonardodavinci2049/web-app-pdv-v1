"use client";

import {
  Building2,
  Hash,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { UICustomerListItem } from "@/services/api-main/customer-general/transformers/transformers";

interface CustomerQuickViewDialogProps {
  customer: UICustomerListItem;
  trigger: React.ReactNode;
}

export function CustomerQuickViewDialog({
  customer,
  trigger,
}: CustomerQuickViewDialogProps) {
  const document = customer.cpf || customer.cnpj;
  const documentLabel = customer.cpf ? "CPF" : customer.cnpj ? "CNPJ" : "";
  const validImage =
    customer.imagePath &&
    (customer.imagePath.startsWith("/") ||
      customer.imagePath.startsWith("http"))
      ? customer.imagePath
      : undefined;
  const [imgSrc, setImgSrc] = useState(validImage || "/avatars/customer.png");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="appearance-none border-0 bg-transparent p-0 text-left"
        >
          {trigger}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
        <div className="flex flex-col items-center gap-3 overflow-hidden bg-muted/30 px-6 pt-6 pb-4">
          <Image
            src={imgSrc}
            alt={customer.name}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full border-2 border-primary/20 object-cover shadow-sm"
            onError={() => setImgSrc("/avatars/customer.png")}
          />
          <DialogHeader className="w-full items-center space-y-0.5 overflow-hidden">
            <DialogTitle className="max-w-full truncate text-center text-base">
              {customer.name}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              #{customer.customerId}
            </p>
          </DialogHeader>
        </div>

        <div className="grid gap-1 px-4 py-4">
          {document && (
            <DetailRow
              icon={ShieldCheck}
              label={documentLabel}
              value={document}
            />
          )}
          {customer.phone && (
            <DetailRow icon={Phone} label="Telefone" value={customer.phone} />
          )}
          {customer.whatsapp && (
            <DetailRow
              icon={Smartphone}
              label="WhatsApp"
              value={customer.whatsapp}
            />
          )}
          {customer.email && (
            <DetailRow icon={Mail} label="E-mail" value={customer.email} />
          )}
          {customer.customerType && (
            <DetailRow
              icon={Hash}
              label="Tipo Cliente"
              value={customer.customerType}
            />
          )}
          {customer.personType && (
            <DetailRow
              icon={User}
              label="Tipo Pessoa"
              value={customer.personType}
            />
          )}
          {customer.companyName && (
            <DetailRow
              icon={Building2}
              label="Empresa"
              value={customer.companyName}
            />
          )}
          {customer.lastPurchase && (
            <DetailRow
              icon={Hash}
              label="Última Compra"
              value={new Date(customer.lastPurchase).toLocaleDateString(
                "pt-BR",
              )}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/40">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
