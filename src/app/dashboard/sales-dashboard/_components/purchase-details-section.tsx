import {
  CalendarDays,
  Check,
  ClipboardList,
  CreditCard,
  Package2,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UIOrderDashboardDetails } from "@/services/api-main/order-sales/transformers/transformers";

interface PurchaseDetailsSectionProps {
  details: UIOrderDashboardDetails | null;
}

// ── helpers ──────────────────────────────────────────────────────────

const ORDER_STATUS_IDS = {
  ORCAMENTO: 22,
  PEDIDO: 12,
  VENDA: 14,
} as const;

const FINANCIAL_STATUS_IDS = {
  PAGO: 17,
} as const;

const DELIVERY_STATUS_IDS = {
  ENTREGUE: 17,
} as const;

interface StepDefinition {
  key: string;
  label: string;
  icon: React.ElementType;
}

const ORDER_STEPS: StepDefinition[] = [
  { key: "orcamento", label: "Orçamento", icon: ClipboardList },
  { key: "pedido", label: "Pedido", icon: ShoppingCart },
  { key: "venda", label: "Venda", icon: Package2 },
  { key: "pago", label: "Pago", icon: CreditCard },
  { key: "entrega", label: "Entrega", icon: Truck },
];

function formatDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return null;
  }
}

/**
 * Derives the current active step index (0-based) and the completion /
 * date state for every step based on the order details from the API.
 *
 * The progression is strictly sequential:
 *   0 ─ Orçamento  (ID_STATUS_PEDIDO = 22)
 *   1 ─ Pedido     (ID_STATUS_PEDIDO = 12)
 *   2 ─ Venda      (ID_STATUS_PEDIDO = 14)
 *   3 ─ Pago       (ID_STATUS_FINANCEIRO = 17)
 *   4 ─ Entrega    (ID_STATUS_ENTREGA = 17)
 */
function deriveSteps(details: UIOrderDashboardDetails) {
  const { orderStatusId, financialStatusId, deliveryStatusId } = details;

  const hasPedidoStep =
    orderStatusId === ORDER_STATUS_IDS.PEDIDO ||
    orderStatusId === ORDER_STATUS_IDS.VENDA;
  const hasVendaStep = orderStatusId === ORDER_STATUS_IDS.VENDA;
  const hasPagoStep = financialStatusId === FINANCIAL_STATUS_IDS.PAGO;
  const hasEntregaStep = deliveryStatusId === DELIVERY_STATUS_IDS.ENTREGUE;

  // Build a simple map of step → completed and its date
  const stepState: {
    completed: boolean;
    date: string | null;
  }[] = [
    {
      // 0 – Orçamento: always true once we have a record
      completed: true,
      date: formatDate(details.createdAt),
    },
    {
      // 1 – Pedido
      completed: hasPedidoStep,
      date: hasPedidoStep ? formatDate(details.orderDate) : null,
    },
    {
      // 2 – Venda
      completed: hasVendaStep,
      date: hasVendaStep ? formatDate(details.saleDate) : null,
    },
    {
      // 3 – Pago
      completed: hasPagoStep,
      date: hasPagoStep ? formatDate(details.saleDate) : null,
    },
    {
      // 4 – Entrega
      completed: hasEntregaStep,
      date: hasEntregaStep ? formatDate(details.deliveryDate) : null,
    },
  ];

  // The active step is the first incomplete step, or the last step if all done
  let activeIndex = stepState.findIndex((s) => !s.completed);
  if (activeIndex === -1) activeIndex = stepState.length - 1;

  return { stepState, activeIndex };
}

// ── sub-components ───────────────────────────────────────────────────

function StepIcon({
  step,
  status,
}: {
  step: StepDefinition;
  status: "completed" | "active" | "pending";
}) {
  const Icon = step.icon;

  return (
    <div
      className={cn(
        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 md:h-12 md:w-12",
        status === "completed" &&
          "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 dark:shadow-emerald-500/20",
        status === "active" &&
          "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20 dark:bg-primary/20 dark:shadow-primary/10",
        status === "pending" &&
          "border-border bg-muted/60 text-muted-foreground dark:bg-muted/30",
      )}
    >
      {status === "completed" ? (
        <Check className="h-4 w-4 md:h-5 md:w-5" strokeWidth={3} />
      ) : (
        <Icon className="h-4 w-4 md:h-5 md:w-5" />
      )}

      {/* pulse ring for active step */}
      {status === "active" && (
        <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/40 opacity-75" />
      )}
    </div>
  );
}

function StepConnector({ status }: { status: "completed" | "pending" }) {
  return (
    <>
      {/* ---- Mobile: vertical connector ---- */}
      <div className="absolute left-5 top-10 -bottom-2 w-0.5 md:hidden">
        <div
          className={cn(
            "h-full w-full rounded-full transition-all duration-500",
            status === "completed"
              ? "bg-emerald-500"
              : "bg-border dark:bg-muted/50",
          )}
        />
      </div>

      {/* ---- Desktop: horizontal connector ---- */}
      <div className="relative mx-1 hidden h-0.5 flex-1 md:block">
        <div className="absolute inset-0 rounded-full bg-border dark:bg-muted/40" />
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
            status === "completed" ? "w-full bg-emerald-500" : "w-0 bg-primary",
          )}
        />
      </div>
    </>
  );
}

function MobileStepCard({
  step,
  status,
  date,
  isLast,
}: {
  step: StepDefinition;
  status: "completed" | "active" | "pending";
  date: string | null;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-6 md:hidden">
      {/* Connector line (except last) */}
      {!isLast && (
        <StepConnector
          status={status === "completed" ? "completed" : "pending"}
        />
      )}

      {/* Icon */}
      <StepIcon step={step} status={status} />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center pt-0.5">
        <span
          className={cn(
            "text-sm font-semibold transition-colors",
            status === "completed" && "text-emerald-600 dark:text-emerald-400",
            status === "active" && "text-primary",
            status === "pending" && "text-muted-foreground",
          )}
        >
          {step.label}
        </span>

        {date ? (
          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {date}
          </span>
        ) : (
          <span className="mt-0.5 text-xs italic text-muted-foreground/60">
            {status === "pending" ? "Aguardando" : "Data não informada"}
          </span>
        )}
      </div>

      {/* Badge */}
      {status === "active" && (
        <span className="mt-1.5 inline-flex h-5 items-center rounded-full bg-primary/10 px-2 text-[10px] font-bold uppercase tracking-wider text-primary dark:bg-primary/20">
          Atual
        </span>
      )}
      {status === "completed" && (
        <span className="mt-1.5 inline-flex h-5 items-center rounded-full bg-emerald-500/10 px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          Concluído
        </span>
      )}
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────

export function PurchaseDetailsSection({
  details,
}: PurchaseDetailsSectionProps) {
  const derived = details ? deriveSteps(details) : null;

  return (
    <Card className="overflow-hidden rounded-[28px] border-border/70 bg-linear-to-b from-card via-card to-muted/40 p-0 shadow-xl shadow-black/10 dark:shadow-black/30">
      {/* Header */}
      <div className="border-b border-border/60 px-5 py-4 md:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Informacoes da compra
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Detalhes da compra
          </h3>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
        {details && derived ? (
          <>
            {/* ── Desktop horizontal stepper ── */}
            <div className="hidden md:block">
              <div className="flex items-center">
                {ORDER_STEPS.map((step, i) => {
                  const status: "completed" | "active" | "pending" = derived
                    .stepState[i].completed
                    ? "completed"
                    : i === derived.activeIndex
                      ? "active"
                      : "pending";

                  return (
                    <div
                      key={step.key}
                      className={cn(
                        "flex items-center",
                        i < ORDER_STEPS.length - 1 ? "flex-1" : "",
                      )}
                    >
                      {/* Step circle + label */}
                      <div className="flex flex-col items-center gap-2">
                        <StepIcon step={step} status={status} />

                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "text-xs font-semibold transition-colors",
                              status === "completed" &&
                                "text-emerald-600 dark:text-emerald-400",
                              status === "active" && "text-primary",
                              status === "pending" && "text-muted-foreground",
                            )}
                          >
                            {step.label}
                          </span>

                          {derived.stepState[i].date ? (
                            <span className="mt-0.5 flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <CalendarDays className="h-2.5 w-2.5" />
                              {derived.stepState[i].date}
                            </span>
                          ) : (
                            <span className="mt-0.5 text-[10px] italic text-muted-foreground/50">
                              {status === "pending" ? "Aguardando" : "Sem data"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Connector to next step */}
                      {i < ORDER_STEPS.length - 1 && (
                        <StepConnector
                          status={
                            derived.stepState[i].completed
                              ? "completed"
                              : "pending"
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Mobile vertical stepper ── */}
            <div className="md:hidden">
              {ORDER_STEPS.map((step, i) => {
                const status: "completed" | "active" | "pending" = derived
                  .stepState[i].completed
                  ? "completed"
                  : i === derived.activeIndex
                    ? "active"
                    : "pending";

                return (
                  <MobileStepCard
                    key={step.key}
                    step={step}
                    status={status}
                    date={derived.stepState[i].date}
                    isLast={i === ORDER_STEPS.length - 1}
                  />
                );
              })}
            </div>

            {/* ── Current status summary bar ── */}
            {/* <div className="mt-2 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Package2 className="h-4 w-4 text-primary" />
                  Status comercial
                </div>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {details.orderStatus || "Aguardando definicao"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Financeiro
                </div>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {details.financialStatus || "Nao informado"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  Entrega e retirada
                </div>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {details.deliveryStatus || "Pendente"}
                </p>
              </div>
            </div> */}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-background/70 p-8 text-center dark:bg-white/4">
            <p className="text-lg font-semibold text-foreground">
              Sem detalhes disponiveis
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              As informacoes detalhadas sobre status comercial, financeiro e
              entrega serao exibidas aqui quando um pedido estiver carregado.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
