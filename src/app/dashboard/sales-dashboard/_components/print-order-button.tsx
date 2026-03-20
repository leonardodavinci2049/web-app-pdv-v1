"use client";

import { Printer } from "lucide-react";
import { useCallback, useState } from "react";
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
import type {
  UIOrderCustomer,
  UIOrderDashboardDetails,
  UIOrderDashboardItem,
  UIOrderSalesSummary,
} from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

interface PrintOrderButtonProps {
  summary: UIOrderSalesSummary | null;
  details: UIOrderDashboardDetails | null;
  items: UIOrderDashboardItem[];
  customer: UIOrderCustomer | null;
}

const FALLBACK_LOGO_SRC = "/images/logo/logo-sidebar.png";

function resolveLogoSrc(
  imageBaseUrl: string,
  logoPath: string | null | undefined,
) {
  if (!logoPath) return FALLBACK_LOGO_SRC;

  const trimmedPath = logoPath.trim();
  if (!trimmedPath) return FALLBACK_LOGO_SRC;

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    return trimmedPath;
  }

  try {
    return new URL(trimmedPath, imageBaseUrl).toString();
  } catch {
    return FALLBACK_LOGO_SRC;
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return "—";
  }
}

function formatCpfCnpj(customer: UIOrderCustomer): string {
  if (customer.cnpj) return customer.cnpj;
  if (customer.cpf) return customer.cpf;
  return "";
}

function buildPrintHtml(params: {
  summary: UIOrderSalesSummary | null;
  details: UIOrderDashboardDetails | null;
  items: UIOrderDashboardItem[];
  customer: UIOrderCustomer | null;
  logoSrc: string;
  companyName: string;
}): string {
  const { summary, details, items, customer, logoSrc, companyName } = params;
  const orderId = summary?.orderId ?? details?.orderId ?? 0;
  const orderDate = formatDate(details?.createdAt);
  const orderStatus = details?.orderStatus ?? "—";

  const subtotal = summary ? Number(summary.subtotalValue) : 0;
  const freight = summary ? Number(summary.freightValue) : 0;
  const additions = summary ? Number(summary.additionValue) : 0;
  const insurance = summary ? Number(summary.insuranceValue) : 0;
  const discount = summary ? Number(summary.discountValue) : 0;
  const total = summary ? Number(summary.totalOrderValue) : 0;

  const itemsHtml = items
    .map(
      (item, index) => `
      <tr>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:13px;">${index + 1}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;">
          <div style="font-weight:500;font-size:13px;color:#1f2937;">${item.product}</div>
          <div style="font-size:11px;color:#9ca3af;margin-top:2px;">
            REF: ${item.ref || "—"}${item.ean ? ` | EAN: ${item.ean}` : ""}
          </div>
        </td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;">${item.quantity}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;">${formatCurrency(Number(item.unitValue))}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;color:#dc2626;">${Number(item.discountValue) > 0 ? `- ${formatCurrency(Number(item.discountValue))}` : "—"}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;font-size:13px;">${formatCurrency(Number(item.totalValue))}</td>
      </tr>`,
    )
    .join("");

  const customerHtml = customer
    ? `
    <div style="margin-top:20px;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
      <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">Dados do Cliente</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:13px;">
        <div><span style="color:#6b7280;">Nome:</span> <strong>${customer.customerName}</strong></div>
        <div><span style="color:#6b7280;">Documento:</span> <strong>${formatCpfCnpj(customer)}</strong></div>
        <div><span style="color:#6b7280;">E-mail:</span> ${customer.email || "—"}</div>
        <div><span style="color:#6b7280;">Telefone:</span> ${customer.phone || "—"}</div>
        ${customer.address ? `<div style="grid-column:1/-1;"><span style="color:#6b7280;">Endereço:</span> ${customer.address}, ${customer.addressNumber}${customer.complement ? `, ${customer.complement}` : ""} — ${customer.neighborhood}, ${customer.city}/${customer.state} — CEP: ${customer.zipCode}</div>` : ""}
      </div>
    </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Pedido #${orderId}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      @page { margin: 15mm 10mm; }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1f2937;
      line-height: 1.5;
      background: #fff;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #111827;padding-bottom:16px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <img src="${logoSrc}" alt="Logo" style="max-height:50px;max-width:180px;object-fit:contain;" />
      <div>
        <div style="font-size:18px;font-weight:700;color:#111827;">${companyName}</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:22px;font-weight:700;color:#111827;">PEDIDO #${orderId}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">Data: ${orderDate}</div>
      <div style="display:inline-block;margin-top:6px;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;background:#e0f2fe;color:#0369a1;">${orderStatus}</div>
    </div>
  </div>

  ${customerHtml}

  <!-- Items -->
  <div style="margin-top:20px;">
    <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">Itens do Pedido (${summary?.itemCount ?? items.length})</h3>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 6px;text-align:center;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e5e7eb;width:40px;">#</th>
          <th style="padding:8px 6px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e5e7eb;">Produto</th>
          <th style="padding:8px 6px;text-align:center;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e5e7eb;width:50px;">Qtd</th>
          <th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e5e7eb;width:100px;">Unitário</th>
          <th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e5e7eb;width:90px;">Desconto</th>
          <th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e5e7eb;width:100px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  </div>

  <!-- Summary -->
  <div style="margin-top:20px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <div style="padding:16px;">
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">
        <span style="color:#6b7280;">Subtotal</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>
      ${
        freight > 0
          ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">
        <span style="color:#6b7280;">Frete</span>
        <span>${formatCurrency(freight)}</span>
      </div>`
          : ""
      }
      ${
        additions > 0
          ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">
        <span style="color:#6b7280;">Adicionais</span>
        <span>${formatCurrency(additions)}</span>
      </div>`
          : ""
      }
      ${
        insurance > 0
          ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">
        <span style="color:#6b7280;">Seguro</span>
        <span>${formatCurrency(insurance)}</span>
      </div>`
          : ""
      }
      ${
        discount > 0
          ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">
        <span style="color:#dc2626;">Desconto</span>
        <span style="color:#dc2626;">- ${formatCurrency(discount)}</span>
      </div>`
          : ""
      }
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#f9fafb;border-top:2px solid #111827;">
      <span style="font-size:16px;font-weight:700;text-transform:uppercase;">Total do Pedido</span>
      <span style="font-size:20px;font-weight:700;">${formatCurrency(total)}</span>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top:24px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px;">
    <p style="margin:0;">Documento gerado em ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date())}</p>
    <p style="margin:4px 0 0 0;">${companyName}</p>
  </div>
</body>
</html>`;
}

export function PrintOrderButton({
  summary,
  details,
  items,
  customer,
}: PrintOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const { meta, imageBaseUrl } = useOrganizationMeta();

  const rawLogoSrc = resolveLogoSrc(imageBaseUrl, meta.IMAGE1);
  // Ensure absolute URL for the print window (about:blank can't resolve relative paths)
  const logoSrc = rawLogoSrc.startsWith("/")
    ? `${window.location.origin}${rawLogoSrc}`
    : rawLogoSrc;
  const companyName = meta.COMMERCIAL_NAME ?? "";

  const handlePrint = useCallback(() => {
    const html = buildPrintHtml({
      summary,
      details,
      items,
      customer,
      logoSrc,
      companyName,
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to render before triggering print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);

    // Close print window only after user finishes printing
    printWindow.addEventListener("afterprint", () => {
      printWindow.close();
    });

    setOpen(false);
  }, [summary, details, items, customer, logoSrc, companyName]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl border-border/70 bg-background/80 text-sm font-semibold shadow-none hover:bg-secondary/70 dark:bg-white/4"
          size="lg"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Imprimir pedido</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja realmente imprimir o pedido #{summary?.orderId ?? 0}? Uma
            nova janela será aberta com a versão para impressão.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
