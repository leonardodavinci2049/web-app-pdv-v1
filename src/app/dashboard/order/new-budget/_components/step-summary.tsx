import { Calendar, MapPin, Package, Phone, User } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UIOrderDashboard } from "@/services/api-main/order-sales/order-sales-cached-service";
import { formatCurrency } from "@/utils/common-utils";

import { SummaryPostActions } from "./summary-post-actions";

interface StepSummaryProps {
  orderDashboard: UIOrderDashboard | undefined;
  orderId: number;
}

export function StepSummary({ orderDashboard, orderId }: StepSummaryProps) {
  const { summary, details, items, customer } = orderDashboard ?? {};
  const isClosed =
    details?.orderStatusId !== undefined && details.orderStatusId > 1;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
              Etapa 4
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Resumo do orçamento #{orderId}
              </h2>
              {/* Details */}
              {details && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Criado em:{" "}
                    {new Date(details.createdAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {details && (
            <Badge variant={isClosed ? "default" : "secondary"}>
              {details.orderStatus || "Em aberto"}
            </Badge>
          )}
        </div>
      </section>

      {/* Customer info */}
      {customer && (
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{customer.customerName}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              {customer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </span>
              )}
              {customer.email && <span>{customer.email}</span>}
              {customer.cpf && <span>CPF: {customer.cpf}</span>}
              {customer.cnpj && <span>CNPJ: {customer.cnpj}</span>}
            </div>
            {customer.address && (
              <p className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                {customer.address}
                {customer.addressNumber && `, ${customer.addressNumber}`}
                {customer.neighborhood && ` - ${customer.neighborhood}`}
                {customer.city && `, ${customer.city}`}
                {customer.state && `/${customer.state}`}
                {customer.zipCode && ` - ${customer.zipCode}`}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Itens ({items?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items && items.length > 0 ? (
            <div className="space-y-2">
              {/* Table header */}
              <div className="hidden grid-cols-12 gap-2 text-xs font-medium text-muted-foreground sm:grid">
                <span className="col-span-6">Produto</span>
                <span className="col-span-2 text-center">Qtd</span>
                <span className="col-span-2 text-right">Unit.</span>
                <span className="col-span-2 text-right">Total</span>
              </div>
              <Separator className="hidden sm:block" />

              {items.map((item) => (
                <div
                  key={item.movementId}
                  className="grid grid-cols-12 items-center gap-2 rounded-md border p-2 text-sm sm:border-0 sm:p-1"
                >
                  <div className="col-span-12 flex items-center gap-2 sm:col-span-6">
                    {item.imagePath ? (
                      <Image
                        src={item.imagePath}
                        alt={item.product}
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="truncate">{item.product}</span>
                  </div>
                  <span className="col-span-4 text-xs text-muted-foreground sm:col-span-2 sm:text-center sm:text-sm">
                    {item.quantity}x
                  </span>
                  <span className="col-span-4 text-right text-xs text-muted-foreground sm:col-span-2 sm:text-sm">
                    {formatCurrency(Number(item.unitValue))}
                  </span>
                  <span className="col-span-4 text-right text-xs font-medium sm:col-span-2 sm:text-sm">
                    {formatCurrency(Number(item.totalValue))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum item no pedido.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary totals */}
      {summary && (
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(summary.subtotalValue))}</span>
              </div>
              {Number(summary.discountValue) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(Number(summary.discountValue))}</span>
                </div>
              )}
              {Number(summary.freightValue) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span>{formatCurrency(Number(summary.freightValue))}</span>
                </div>
              )}
              {Number(summary.additionValue) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acréscimo</span>
                  <span>{formatCurrency(Number(summary.additionValue))}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(Number(summary.totalOrderValue))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isClosed && (
        <SummaryPostActions orderId={orderId} orderDashboard={orderDashboard} />
      )}
    </div>
  );
}
