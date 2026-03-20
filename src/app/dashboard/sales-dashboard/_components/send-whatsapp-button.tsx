"use client";

import { MessageCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useOrganizationMeta } from "@/components/common/organization-meta-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  UIOrderCustomer,
  UIOrderDashboardDetails,
  UIOrderDashboardItem,
  UIOrderSalesSummary,
} from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

interface SendWhatsAppButtonProps {
  summary: UIOrderSalesSummary | null;
  details: UIOrderDashboardDetails | null;
  items: UIOrderDashboardItem[];
  customer: UIOrderCustomer | null;
}

/**
 * Remove tudo que não é dígito e normaliza para formato internacional BR.
 * Aceita: 16999991234, (16)99999-1234, +5516999991234, etc.
 * Retorna: 5516999991234 ou string vazia se inválido.
 */
function normalizeBrazilianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");

  if (digits.length < 10) return "";

  // Já tem código do país 55
  if (digits.startsWith("55") && digits.length >= 12 && digits.length <= 13) {
    return digits;
  }

  // DDD + número (10 ou 11 dígitos)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return "";
}

function isValidPhone(phone: string): boolean {
  return normalizeBrazilianPhone(phone).length >= 12;
}

function getCustomerPhone(customer: UIOrderCustomer | null): string {
  if (!customer) return "";
  if (customer.whatsapp?.trim()) return customer.whatsapp.trim();
  if (customer.phone?.trim()) return customer.phone.trim();
  return "";
}

function formatOrderDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return "—";
  }
}

function translateStatus(status: string | undefined): string {
  if (!status) return "pedido";
  const map: Record<string, string> = {
    ORCAMENTO: "orçamento",
    PEDIDO: "pedido",
    VENDA: "venda",
    CANCELADO: "pedido cancelado",
  };
  return map[status.toUpperCase()] ?? status.toLowerCase();
}

function buildWhatsAppMessage(params: {
  summary: UIOrderSalesSummary | null;
  details: UIOrderDashboardDetails | null;
  items: UIOrderDashboardItem[];
  customer: UIOrderCustomer | null;
  companyName: string;
}): string {
  const { summary, details, items, customer, companyName } = params;
  const orderId = summary?.orderId ?? details?.orderId ?? 0;
  const status = translateStatus(details?.orderStatus);
  const customerName = customer?.customerName ?? "Cliente";
  const orderDate = formatOrderDate(details?.createdAt);

  const subtotal = summary ? Number(summary.subtotalValue) : 0;
  const discount = summary ? Number(summary.discountValue) : 0;
  const total = summary ? Number(summary.totalOrderValue) : 0;

  const itemsText = items
    .map(
      (item, i) =>
        `${i + 1}. ${item.product}\n   Qtd: ${item.quantity} × ${formatCurrency(Number(item.unitValue))} = ${formatCurrency(Number(item.totalValue))}`,
    )
    .join("\n");

  const lines = [
    `Olá *${customerName}*, segue os dados do *${status}* conforme solicitado:`,
    "",
    `📋 *PEDIDO #${orderId}*`,
    `📅 Data: ${orderDate}`,
    `📌 Status: ${status.toUpperCase()}`,
    "",
    "🛒 *Itens:*",
    itemsText,
    "",
    "💰 *Resumo:*",
    `Subtotal: ${formatCurrency(subtotal)}`,
  ];

  if (discount > 0) {
    lines.push(`Desconto: - ${formatCurrency(discount)}`);
  }

  lines.push(`*Total: ${formatCurrency(total)}*`);
  lines.push("");
  lines.push(`_${companyName}_`);

  return lines.join("\n");
}

export function SendWhatsAppButton({
  summary,
  details,
  items,
  customer,
}: SendWhatsAppButtonProps) {
  const [open, setOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const { meta } = useOrganizationMeta();

  const companyName = meta.COMMERCIAL_NAME ?? "";
  const customerPhone = getCustomerPhone(customer);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setPhoneInput(customerPhone);
      }
      setOpen(isOpen);
    },
    [customerPhone],
  );

  const handleSend = useCallback(() => {
    const phoneToUse = phoneInput;

    if (!isValidPhone(phoneToUse)) {
      toast.error("Informe um número de WhatsApp válido com DDD");
      return;
    }

    const normalized = normalizeBrazilianPhone(phoneToUse);
    const message = buildWhatsAppMessage({
      summary,
      details,
      items,
      customer,
      companyName,
    });

    const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }, [summary, details, items, customer, companyName, phoneInput]);

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl border-border/70 bg-background/80 text-sm font-semibold shadow-none hover:bg-secondary/70 dark:bg-white/4"
          size="lg"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar WhatsApp
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enviar pedido via WhatsApp</AlertDialogTitle>
          <AlertDialogDescription>
            Os dados do pedido #{summary?.orderId ?? 0} serão enviados para o
            WhatsApp do cliente <strong>{customer?.customerName ?? "—"}</strong>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="whatsapp-phone" className="text-sm font-medium">
            Número do WhatsApp
          </Label>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 shrink-0 text-green-600" />
            <Input
              id="whatsapp-phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Você pode alterar o número antes de enviar. Informe com DDD.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
