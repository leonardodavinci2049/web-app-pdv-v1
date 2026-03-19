"use client";

import { FilePlus, List, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";

import { sendOrderEmailAction } from "../actions/send-order-email-action";
import { SummaryPdfButton } from "./summary-pdf-button";

interface SummaryPostActionsProps {
  orderId: number;
  orderDashboard: UIOrderDashboard | undefined;
}

export function SummaryPostActions({
  orderId,
  orderDashboard,
}: SummaryPostActionsProps) {
  const [state, formAction, isPending] = useActionState(
    sendOrderEmailAction,
    null,
  );
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    if (state?.success) {
      toast.success(state.message);
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

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

          <form action={formAction}>
            <input type="hidden" name="orderId" value={orderId} />
            <Button
              type="submit"
              variant="outline"
              className="h-auto w-full flex-col gap-1 py-4"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Mail className="h-5 w-5" />
              )}
              <span className="text-xs">Enviar por E-mail</span>
            </Button>
          </form>

          <SummaryPdfButton orderId={orderId} orderDashboard={orderDashboard} />
        </div>
      </CardContent>
    </Card>
  );
}
