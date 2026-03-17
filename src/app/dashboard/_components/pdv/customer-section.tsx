import {
  BadgeCheck,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { UIOrderCustomer } from "@/services/api-main/order-sales/transformers/transformers";

interface CustomerSectionProps {
  customer: UIOrderCustomer | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getDocumentLabel(customer: UIOrderCustomer): string | null {
  if (customer.cnpj) return customer.cnpj;
  if (customer.cpf) return customer.cpf;
  return null;
}

function formatLastPurchase(date: string | null): string {
  if (!date) return "Sem historico de compras";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function CustomerSection({ customer }: CustomerSectionProps) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-border/70 bg-gradient-to-b from-card via-card to-muted/40 p-0 shadow-xl shadow-black/10 dark:shadow-black/30">
      <div className="border-b border-border/60 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Cliente e relacionamento
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Identidade do comprador
            </h3>
  
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-full px-4">
              <Search className="h-4 w-4" />
              Buscar cliente
            </Button>
            <Button size="sm" className="rounded-full px-4">
              <UserPlus className="h-4 w-4" />
              Novo cadastro
            </Button>
          </div>
        </div>
      </div>

      {customer ? (
        <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="h-16 w-16 rounded-[24px] ring-4 ring-primary/10 md:h-20 md:w-20">
                {customer.imagePath ? (
                  <AvatarImage
                    src={customer.imagePath}
                    alt={customer.customerName}
                  />
                ) : null}
                <AvatarFallback className="rounded-[24px] bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(customer.customerName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                    {customer.customerName}
                  </h4>
                  <Badge className="rounded-full bg-primary/10 px-3 text-primary hover:bg-primary/10">
                    Cliente ativo
                  </Badge>
                  {customer.lastPurchaseDate && (
                    <Badge variant="outline" className="rounded-full px-3">
                      Recorrente
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {customer.accountStatus && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                      {customer.accountStatus}
                    </span>
                  )}
                  {customer.accountType && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1">
                      Perfil {customer.accountType}
                    </span>
                  )}
                </div>

   
              </div>
            </div>

            <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Ultima compra
              </p>
              <p className="mt-2 font-semibold text-foreground">
                {formatLastPurchase(customer.lastPurchaseDate)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                Contato
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {customer.phone || customer.whatsapp || "Nao informado"}
              </p>
      
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Documento e email
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {getDocumentLabel(customer) || "Documento nao informado"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {customer.email || "Email nao informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Localidade
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {customer.city && customer.state
                  ? `${customer.city} - ${customer.state}`
                  : "Endereco nao informado"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {customer.neighborhood ||
                  customer.address ||
                  "Sem dados complementares"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                Relacao comercial
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Cadastro desde {formatLastPurchase(customer.createdAt)}
              </p>
   
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 py-6 md:px-6 md:py-8">
          <div className="rounded-[24px] border border-dashed border-border bg-background/70 p-8 text-center dark:bg-white/4">
            <p className="text-lg font-semibold text-foreground">
              Nenhum cliente selecionado
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Inicie a venda vinculando um cliente para liberar uma experiencia
              mais orientada, com contexto comercial e fechamento mais seguro.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button variant="outline" className="rounded-full px-4">
                <Search className="h-4 w-4" />
                Buscar cliente
              </Button>
              <Button className="rounded-full px-4">
                <UserPlus className="h-4 w-4" />
                Cadastrar cliente
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
