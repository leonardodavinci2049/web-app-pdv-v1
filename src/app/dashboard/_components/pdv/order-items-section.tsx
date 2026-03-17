import {
  Boxes,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { UIOrderDashboardItem } from "@/services/api-main/order-sales/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";

interface OrderItemsSectionProps {
  items: UIOrderDashboardItem[];
}

function formatWarranty(warrantyDays: number): string | null {
  if (!warrantyDays) return null;
  return `${warrantyDays} dias de garantia`;
}

export function OrderItemsSection({ items }: OrderItemsSectionProps) {
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Card className="flex min-h-105 flex-1 overflow-hidden rounded-[28px] border-border/70 bg-gradient-to-b from-card via-card to-muted/40 p-0 shadow-xl shadow-black/10 dark:shadow-black/30">
      <div className="border-b border-border/60 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Carrinho e produtos
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                Itens do pedido
              </h3>
              <Badge variant="outline" className="rounded-full px-3">
                {items.length} produtos
              </Badge>
              <Badge className="rounded-full bg-primary/10 px-3 text-primary hover:bg-primary/10">
                {totalUnits} unidades
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Estrutura visual pensada para leitura rapida, ajuste de quantidade
              e valorizacao do mix vendido.
            </p>
          </div>

          <Button size="sm" className="rounded-full px-4">
            <Plus className="h-4 w-4" />
            Adicionar produto
          </Button>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:px-6 md:py-5">
          {items.map((item) => (
            <Card
              key={item.movementId}
              className="group relative gap-0 overflow-hidden rounded-[24px] border border-border/70 bg-background/85 p-0 shadow-lg shadow-black/5 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-xl hover:shadow-black/10 dark:bg-white/3"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full border border-border/60 bg-background/90 text-muted-foreground opacity-100 backdrop-blur transition-opacity hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_230px] md:p-5">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-4xl border border-border/60 bg-muted/50 md:h-24 md:w-24">
                    {item.imagePath ? (
                      <Image
                        src={item.imagePath}
                        alt={item.product}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary/50 p-2 text-center text-xs text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.label && (
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 py-0.5 text-[11px]"
                          >
                            {item.label}
                          </Badge>
                        )}
                        {item.model && (
                          <Badge className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary hover:bg-primary/10">
                            {item.model}
                          </Badge>
                        )}
                        {item.promotion ? (
                          <Badge className="rounded-full bg-accent px-2.5 py-0.5 text-accent-foreground hover:bg-accent">
                            Oferta ativa
                          </Badge>
                        ) : null}
                      </div>

                      <div>
                        <h4 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground md:text-lg">
                          {item.product}
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          SKU {item.sku || "nao informado"} • REF{" "}
                          {item.ref || "nao informada"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {formatWarranty(item.warrantyDays) ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                          {formatWarranty(item.warrantyDays)}
                        </span>
                      ) : null}

                      <span className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1">
                        <Boxes className="h-3.5 w-3.5 text-primary" />
                        Estoque loja {item.storeStock}
                      </span>

                      {item.notes ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1">
                          Observacao disponivel
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 md:items-end">
                  <div className="grid gap-3 sm:grid-cols-2 md:w-full md:grid-cols-1">
                    <div className="rounded-2xl border border-border/60 bg-secondary/35 px-4 py-3 md:text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Preco unitario
                      </p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {formatCurrency(Number(item.unitValue))}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 md:text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                        Total do item
                      </p>
                      <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                        {formatCurrency(Number(item.totalValue))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/90 p-2 md:min-w-55 dark:bg-white/4">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full hover:bg-secondary/80"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>

                    <div className="text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Quantidade
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {item.quantity}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full hover:bg-secondary/80"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-5 py-10 md:px-6">
          <div className="w-full rounded-[24px] border border-dashed border-border bg-background/70 p-10 text-center dark:bg-white/4">
            <p className="text-lg font-semibold text-foreground">
              Nenhum item no carrinho
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Monte a venda com produtos de maior apelo visual, mantendo
              quantidade, preco e beneficios em evidenca para o vendedor.
            </p>
            <Button className="mt-5 rounded-full px-4">
              <Plus className="h-4 w-4" />
              Adicionar primeiro produto
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
