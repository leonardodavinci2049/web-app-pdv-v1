import {
  BadgeCheck,
  Building2,
  Calendar,
  Clock3,
  FileText,
  Hash,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UIOrderCustomer } from "@/services/api-main/order-sales/transformers/transformers";
import { CustomerAddressInlineSection } from "./customer-address-inline-section";
import { CustomerInlineTextField } from "./customer-inline-text-field";
import { CustomerNotesInlineField } from "./customer-notes-inline-field";

interface CustomerSectionProps {
  customer: UIOrderCustomer | null;
  orderId: number;
  orderStatusId: number;
}

const EDITABLE_ORDER_STATUS_ID = 22;

// ── Helpers ──────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatDate(date: string | null): string {
  if (!date) return "Não informado";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "Data inválida";
  }
}

function getLastPurchaseDate(
  lastPurchase: string | null,
  createdAt: string | null,
): string | null {
  if (!createdAt) return null;
  if (!lastPurchase) return createdAt;
  try {
    const lastDate = new Date(lastPurchase);
    const createdDate = new Date(createdAt);
    return lastDate < createdDate ? createdAt : lastPurchase;
  } catch {
    return createdAt;
  }
}

function formatCpf(cpf: string): string {
  if (!cpf || cpf.length !== 11) return cpf || "Não informado";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj || "Não informado";
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatPhone(phone: string): string {
  if (!phone) return "Não informado";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

function hasValue(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string")
    return value.trim() !== "" && value.trim() !== "0";
  return value !== 0;
}

// ── Sub-components ───────────────────────────────────────────────────

function InfoField({
  icon: Icon,
  label,
  value,
  mono = false,
  className,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string;
  mono?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      {children ?? (
        <p
          className={cn(
            "text-sm font-medium text-foreground",
            mono && "font-mono tracking-wide",
            !hasValue(value) && "italic text-muted-foreground/60",
          )}
        >
          {hasValue(value) ? value : "Não informado"}
        </p>
      )}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
  className,
  accentColor = "primary",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-background/75 p-4 transition-all duration-200 hover:border-border hover:shadow-sm dark:bg-white/3 dark:hover:bg-white/5",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center gap-2 border-b border-border/50 pb-3 text-xs font-semibold uppercase tracking-[0.2em]",
          accentColor === "primary" && "text-primary",
          accentColor === "emerald" && "text-emerald-600 dark:text-emerald-400",
          accentColor === "amber" && "text-amber-600 dark:text-amber-400",
          accentColor === "violet" && "text-violet-600 dark:text-violet-400",
          accentColor === "sky" && "text-sky-600 dark:text-sky-400",
        )}
      >
        <Icon className="h-4 w-4" />
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function CustomerSection({
  customer,
  orderId,
  orderStatusId,
}: CustomerSectionProps) {
  const isPessoaFisica = customer?.personTypeId === 1;
  const isPessoaJuridica = customer?.personTypeId === 2;
  const canEditCustomerInfo = orderStatusId === EDITABLE_ORDER_STATUS_ID;

  const displayLastPurchaseDate = customer
    ? getLastPurchaseDate(customer.lastPurchaseDate, customer.createdAt)
    : null;

  return (
    <Card className="overflow-hidden rounded-[28px] border-border/70 bg-linear-to-b from-card via-card to-muted/40 p-0 shadow-xl shadow-black/10 dark:shadow-black/30">
      {/* Header */}
      <div className="border-b border-border/60 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Informações do cliente
            </div>
          </div>
        </div>
      </div>

      {customer ? (
        <div className="space-y-4 px-5 py-5 md:px-6 md:py-6">
          {/* ── Card 1: Informações Gerais ── */}
          <SectionCard
            icon={User}
            title="Informações Gerais"
            accentColor="primary"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              {/* Avatar + Name */}
              <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-start">
                <Avatar className="h-20 w-20 shrink-0 rounded-2xl ring-4 ring-primary/10 md:h-20 md:w-20">
                  <AvatarImage
                    src={customer.imagePath || "/avatars/customer.png"}
                    alt={customer.customerName}
                  />
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                    {getInitials(customer.customerName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 space-y-2.5 text-center sm:text-left">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
                      ID #{customer.customerId}
                    </p>
                    <CustomerInlineTextField
                      customerId={customer.customerId}
                      orderId={orderId}
                      orderStatusId={orderStatusId}
                      field="customerName"
                      value={customer.customerName}
                      variant="title"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    {customer.accountType && (
                      <Badge
                        variant="outline"
                        className="rounded-full border-primary/30 bg-primary/5 px-3 text-xs font-medium text-primary"
                      >
                        <User className="mr-1 h-3 w-3" />
                        {customer.accountType}
                      </Badge>
                    )}
                    {customer.accountStatus && (
                      <Badge
                        className={cn(
                          "rounded-full px-3 text-xs font-medium",
                          customer.accountStatus.toUpperCase() === "APROVADA"
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400",
                        )}
                      >
                        <BadgeCheck className="mr-1 h-3 w-3" />
                        {customer.accountStatus}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Date cards */}
              <div className="flex w-full justify-center gap-3 lg:w-auto lg:justify-start">
                <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                    Cliente desde
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                    <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(customer.createdAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                    Última compra
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {formatDate(displayLastPurchaseDate)}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Card 2: Contato ── */}
          <SectionCard icon={Phone} title="Contato" accentColor="emerald">
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoField icon={Phone} label="Telefone">
                <CustomerInlineTextField
                  customerId={customer.customerId}
                  orderId={orderId}
                  orderStatusId={orderStatusId}
                  field="phone"
                  value={customer.phone}
                  displayValue={formatPhone(customer.phone)}
                  emptyText="Não informado"
                />
              </InfoField>
              <InfoField icon={MessageCircle} label="WhatsApp">
                <CustomerInlineTextField
                  customerId={customer.customerId}
                  orderId={orderId}
                  orderStatusId={orderStatusId}
                  field="whatsapp"
                  value={customer.whatsapp}
                  displayValue={formatPhone(customer.whatsapp)}
                  emptyText="Não informado"
                />
              </InfoField>
              <InfoField icon={Mail} label="E-mail">
                <CustomerInlineTextField
                  customerId={customer.customerId}
                  orderId={orderId}
                  orderStatusId={orderStatusId}
                  field="email"
                  value={customer.email}
                  emptyText="Não informado"
                />
              </InfoField>
            </div>
          </SectionCard>

          {/* ── Card 3 & 4: Pessoa Física / Jurídica side by side ── */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Card 3: Pessoa Física */}
            <SectionCard
              icon={FileText}
              title="Pessoa Física"
              accentColor="violet"
              className={cn(!isPessoaFisica && "opacity-50")}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField icon={Hash} label="CPF" mono>
                  <CustomerInlineTextField
                    customerId={customer.customerId}
                    orderId={orderId}
                    orderStatusId={orderStatusId}
                    isEditable={isPessoaFisica}
                    field="cpf"
                    value={customer.cpf}
                    displayValue={formatCpf(customer.cpf)}
                    emptyText="Não informado"
                  />
                </InfoField>
                <InfoField icon={ShieldCheck} label="RG" mono>
                  <CustomerInlineTextField
                    customerId={customer.customerId}
                    orderId={orderId}
                    orderStatusId={orderStatusId}
                    isEditable={isPessoaFisica}
                    field="rg"
                    value={customer.rg}
                    emptyText="Não informado"
                  />
                </InfoField>
              </div>
              {isPessoaFisica && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-violet-500/5 px-3 py-1.5 text-[11px] font-medium text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Tipo de conta ativa: Pessoa Física
                </div>
              )}
            </SectionCard>

            {/* Card 4: Pessoa Jurídica */}
            <SectionCard
              icon={Building2}
              title="Pessoa Jurídica"
              accentColor="amber"
              className={cn(!isPessoaJuridica && "opacity-50")}
            >
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoField label="Razão Social">
                    <CustomerInlineTextField
                      customerId={customer.customerId}
                      orderId={orderId}
                      orderStatusId={orderStatusId}
                      isEditable={isPessoaJuridica}
                      field="companyName"
                      value={customer.companyName}
                      emptyText="Não informado"
                    />
                  </InfoField>
                  <InfoField label="Nome Fantasia">
                    <CustomerInlineTextField
                      customerId={customer.customerId}
                      orderId={orderId}
                      orderStatusId={orderStatusId}
                      isEditable={isPessoaJuridica}
                      field="tradeName"
                      value={customer.tradeName}
                      emptyText="Não informado"
                    />
                  </InfoField>
                </div>
                <div className="space-y-4">
                  <InfoField icon={Hash} label="CNPJ" mono>
                    <CustomerInlineTextField
                      customerId={customer.customerId}
                      orderId={orderId}
                      orderStatusId={orderStatusId}
                      isEditable={isPessoaJuridica}
                      field="cnpj"
                      value={customer.cnpj}
                      displayValue={formatCnpj(customer.cnpj)}
                      emptyText="Não informado"
                    />
                  </InfoField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoField label="Inscrição Estadual" mono>
                      <CustomerInlineTextField
                        customerId={customer.customerId}
                        orderId={orderId}
                        orderStatusId={orderStatusId}
                        isEditable={isPessoaJuridica}
                        field="stateRegistration"
                        value={customer.stateRegistration}
                        emptyText="Não informado"
                      />
                    </InfoField>
                    <InfoField label="Inscrição Municipal" mono>
                      <CustomerInlineTextField
                        customerId={customer.customerId}
                        orderId={orderId}
                        orderStatusId={orderStatusId}
                        isEditable={isPessoaJuridica}
                        field="municipalRegistration"
                        value={customer.municipalRegistration}
                        emptyText="Não informado"
                      />
                    </InfoField>
                  </div>
                </div>
              </div>
              {isPessoaJuridica && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-500/5 px-3 py-1.5 text-[11px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Tipo de conta ativa: Pessoa Jurídica
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Card 5: Endereço ── */}
          <SectionCard icon={MapPin} title="Endereço" accentColor="sky">
            {!canEditCustomerInfo && (
              <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-sm text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                Edicao disponivel apenas quando o pedido estiver no status de
                orcamento.
              </div>
            )}
            <CustomerAddressInlineSection
              customer={customer}
              orderId={orderId}
              orderStatusId={orderStatusId}
            />
          </SectionCard>

          <SectionCard icon={FileText} title="Anotações" accentColor="primary">
            <CustomerNotesInlineField
              customerId={customer.customerId}
              orderId={orderId}
              orderStatusId={orderStatusId}
              notes={customer.notes}
            />
          </SectionCard>
        </div>
      ) : (
        <div className="px-5 py-6 md:px-6 md:py-8">
          <div className="rounded-3xl border border-dashed border-border bg-background/70 p-8 text-center dark:bg-white/4">
            <p className="text-lg font-semibold text-foreground">
              Nenhum cliente selecionado
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Inicie a venda vinculando um cliente para liberar uma experiência
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
