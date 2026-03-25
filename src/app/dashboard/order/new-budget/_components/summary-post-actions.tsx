"use client";

import { FilePlus, List } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";

import { SendWhatsAppButton } from "@/app/dashboard/sales-dashboard/_components/send-whatsapp-button";
import { SummaryPdfButton } from "./summary-pdf-button";

interface SummaryPostActionsProps {
  orderId: number;
  orderDashboard: UIOrderDashboard | undefined;
}

export function SummaryPostActions({
  orderId,
  orderDashboard,
}: SummaryPostActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Próximos passos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="outline"
            asChild
            className="h-auto flex-col gap-1 py-4"
          >
            <Link href="/dashboard/order/new-budget">
              <FilePlus className="h-5 w-5" />
              <span className="text-xs">Novo Orçamento</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
            className="h-auto flex-col gap-1 py-4"
          >
            <Link href={`/dashboard/sales-dashboard?orderId=${orderId}`}>
              <List className="h-5 w-5" />
              <span className="text-xs">Ver Orçamento</span>
            </Link>
          </Button>

          <SendWhatsAppButton
            summary={orderDashboard?.summary ?? null}
            details={orderDashboard?.details ?? null}
            items={orderDashboard?.items ?? []}
            customer={orderDashboard?.customer ?? null}
            triggerClassName="h-auto w-full flex-col gap-1 py-4"
          />

          <SummaryPdfButton orderId={orderId} orderDashboard={orderDashboard} />
        </div>
      </CardContent>
    </Card>
  );
}
