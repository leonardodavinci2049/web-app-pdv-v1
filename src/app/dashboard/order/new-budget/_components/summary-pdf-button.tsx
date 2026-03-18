"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { UIOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";

interface SummaryPdfButtonProps {
  orderId: number;
  orderDashboard: UIOrderDashboard | undefined;
}

export function SummaryPdfButton({
  orderId,
  orderDashboard,
}: SummaryPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { OrderPdfDocument } = await import("./order-pdf-document");

      const customer = orderDashboard?.customer ?? null;
      const items = (orderDashboard?.items ?? []).map((i) => ({
        product: i.product,
        quantity: i.quantity,
        unitValue: i.unitValue,
        totalValue: i.totalValue,
      }));
      const summary = orderDashboard?.summary
        ? {
            subtotalValue: orderDashboard.summary.subtotalValue,
            discountValue: orderDashboard.summary.discountValue,
            freightValue: orderDashboard.summary.freightValue,
            additionValue: orderDashboard.summary.additionValue,
            totalOrderValue: orderDashboard.summary.totalOrderValue,
          }
        : null;
      const createdAt = orderDashboard?.details?.createdAt ?? undefined;

      const blob = await pdf(
        <OrderPdfDocument
          orderId={orderId}
          customer={customer}
          items={items}
          summary={summary}
          createdAt={createdAt}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orcamento-${orderId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error("Erro ao gerar PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="h-auto flex-col gap-1 py-4"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Download className="h-5 w-5" />
      )}
      <span className="text-xs">Download PDF</span>
    </Button>
  );
}
