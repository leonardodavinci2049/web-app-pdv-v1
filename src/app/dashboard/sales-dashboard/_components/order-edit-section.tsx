import { FileText, PencilLine, Percent, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";

const PRICE_FIELDS = [
  {
    icon: Truck,
    label: "Valor do frete",
    description: "Campo reservado para ajustar o valor de frete do pedido.",
  },
  {
    icon: Percent,
    label: "Desconto do pedido",
    description: "Campo reservado para aplicar ou revisar o desconto geral.",
  },
] as const;

const ORDER_NOTES = {
  icon: FileText,
  label: "Anotacoes do pedido",
  description: "Area reservada para observacoes comerciais e operacionais.",
} as const;

export function OrderEditSection() {
  return (
    <Card className="overflow-hidden rounded-[28px] border-border/70 bg-linear-to-b from-card via-card to-muted/40 p-0 shadow-xl shadow-black/10 dark:shadow-black/30">
      <div className="border-b border-border/60 px-5 py-4 md:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            <PencilLine className="h-3.5 w-3.5" />
            Edicao do pedido
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Campos em preparacao
          </h3>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 md:px-6 md:py-6">


        <div className="rounded-3xl border border-border/70 bg-background/75 p-4 shadow-sm dark:bg-white/3 md:p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <PencilLine className="h-4 w-4" />
            Frete e desconto
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PRICE_FIELDS.map((field) => {
              const Icon = field.icon;

              return (
                <div
                  key={field.label}
                  className="rounded-2xl border border-border/70 bg-muted/30 p-4 dark:bg-white/2"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {field.label}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {field.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-background/75 p-4 shadow-sm dark:bg-white/3 md:p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <FileText className="h-4 w-4" />
            Anotacoes do pedido
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 dark:bg-white/2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ORDER_NOTES.icon className="h-4 w-4 text-primary" />
              {ORDER_NOTES.label}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {ORDER_NOTES.description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
