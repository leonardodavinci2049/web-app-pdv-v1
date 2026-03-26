import { AlertTriangle, ArrowLeft, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OrderLoadErrorStateProps {
  errorMessage?: string | null;
  orderId?: number;
}

export function OrderLoadErrorState({
  errorMessage,
  orderId,
}: OrderLoadErrorStateProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/95 shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--destructive)/0.16),transparent_42%),radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.12),transparent_38%)]" />

      <div className="relative grid gap-6 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:gap-8">
        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium tracking-[0.18em] uppercase text-destructive">
            <AlertTriangle className="size-3.5" />
            Pedido indisponível
          </div>

          <h1 className="max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Não foi possível carregar este pedido agora.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            O painel de venda não conseguiu montar os dados necessários para
            exibir o pedido. Você pode voltar para outras áreas do fluxo de
            vendas enquanto o cadastro do vendedor ou os dados do pedido são
            ajustados.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/order/new-budget">
                <Plus className="size-4" />
                Novo orçamento
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/dashboard/order/order-list">
                <ClipboardList className="size-4" />
                Ver lista de pedidos
              </Link>
            </Button>

            <Button variant="ghost" asChild className="w-full sm:w-auto">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                Voltar ao dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 bg-background/85 backdrop-blur-sm">
          <CardHeader className="gap-4 border-b border-border/60 pb-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-destructive shadow-sm">
                <AlertTriangle className="size-6" />
              </div>

              <div className="min-w-0">
                <CardTitle className="text-lg">
                  Falha ao consultar o pedido
                </CardTitle>
                <CardDescription className="mt-1 leading-6">
                  {orderId != null && orderId > 0
                    ? `Pedido #${orderId} não pôde ser carregado com segurança.`
                    : "Nenhum pedido válido pôde ser carregado nesta rota."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <Alert
              variant="destructive"
              className="border-destructive/20 bg-destructive/5"
            >
              <AlertTriangle className="size-4" />
              <AlertTitle>Mensagem da API</AlertTitle>
              <AlertDescription>
                {errorMessage ??
                  "Não foi possível obter os dados do pedido no momento."}
              </AlertDescription>
            </Alert>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm font-medium tracking-tight">
                O que você pode fazer agora
              </p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                <p>
                  Verifique se o vendedor já possui um ID válido vinculado ao
                  cadastro.
                </p>
                <p>Tente abrir outro pedido ou iniciar um novo orçamento.</p>
                <p>
                  Se o problema persistir, revise os parâmetros enviados para a
                  API.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
