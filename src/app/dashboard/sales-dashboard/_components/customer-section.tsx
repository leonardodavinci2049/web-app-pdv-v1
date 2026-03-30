import {
  BadgeCheck,
  Building2,
  Calendar,
  Clock3,
  FileText,
  Globe,
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

interface CustomerSectionProps {
  customer: UIOrderCustomer | null;
}

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

function formatCpf(cpf: string): string {
  if (!cpf || cpf.length !== 11) return cpf || "Não informado";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj || "Não informado";
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatCep(cep: string): string {
  if (!cep || cep.length !== 8) return cep || "Não informado";
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
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
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <p
        className={cn(
          "text-sm font-medium text-foreground",
          mono && "font-mono tracking-wide",
          !hasValue(value) && "italic text-muted-foreground/60",
        )}
      >
        {hasValue(value) ? value : "Não informado"}
      </p>
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
        "rounded-2xl border border-border/70 bg-background/75 p-4 transition-all duration-200 hover:border-border hover:shadow-sm dark:bg-white/[0.03] dark:hover:bg-white/[0.05]",
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

export function CustomerSection({ customer }: CustomerSectionProps) {
  const isPessoaFisica = customer?.personTypeId === 1;
  const isPessoaJuridica = customer?.personTypeId === 2;

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
              <div className="flex min-w-0 items-start gap-4">
                <Avatar className="h-16 w-16 shrink-0 rounded-2xl ring-4 ring-primary/10 md:h-20 md:w-20">
                  {customer.imagePath ? (
                    <AvatarImage
                      src={customer.imagePath}
                      alt={customer.customerName}
                    />
                  ) : null}
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                    {getInitials(customer.customerName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 space-y-2.5">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
                      ID #{customer.customerId}
                    </p>
                    <h4 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                      {customer.customerName}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
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
              <div className="flex flex-wrap gap-3 lg:flex-col">
                <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                    Última compra
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {formatDate(customer.lastPurchaseDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                    Cliente desde
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(customer.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Card 2: Contato ── */}
          <SectionCard icon={Phone} title="Contato" accentColor="emerald">
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoField
                icon={Phone}
                label="Telefone"
                value={formatPhone(customer.phone)}
              />
              <InfoField
                icon={MessageCircle}
                label="WhatsApp"
                value={
                  hasValue(customer.whatsapp)
                    ? formatPhone(customer.whatsapp)
                    : "Não informado"
                }
              />
              <InfoField icon={Mail} label="E-mail" value={customer.email} />
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
                <InfoField
                  icon={Hash}
                  label="CPF"
                  value={formatCpf(customer.cpf)}
                  mono
                />
                <InfoField
                  icon={ShieldCheck}
                  label="RG"
                  value={hasValue(customer.rg) ? customer.rg : "Não informado"}
                  mono
                />
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
                  <InfoField
                    label="Razão Social"
                    value={customer.companyName}
                  />
                  <InfoField label="Nome Fantasia" value={customer.tradeName} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <InfoField
                    icon={Hash}
                    label="CNPJ"
                    value={formatCnpj(customer.cnpj)}
                    mono
                  />
                  <InfoField
                    label="Inscrição Estadual"
                    value={
                      hasValue(customer.stateRegistration)
                        ? customer.stateRegistration
                        : "Não informado"
                    }
                    mono
                  />
                  <InfoField
                    label="Inscrição Municipal"
                    value={
                      hasValue(customer.municipalRegistration)
                        ? customer.municipalRegistration
                        : "Não informado"
                    }
                    mono
                  />
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
            <div className="space-y-4">
              {/* Main address line */}
              <div className="rounded-xl border border-sky-500/10 bg-sky-500/[0.03] px-4 py-3 dark:bg-sky-500/[0.06]">
                <p className="text-sm font-medium text-foreground">
                  {hasValue(customer.address) ? (
                    <>
                      {customer.address}
                      {hasValue(customer.addressNumber) &&
                        `, ${customer.addressNumber}`}
                      {hasValue(customer.complement) &&
                        ` - ${customer.complement}`}
                    </>
                  ) : (
                    <span className="italic text-muted-foreground/60">
                      Endereço não informado
                    </span>
                  )}
                </p>
                {hasValue(customer.neighborhood) && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {customer.neighborhood}
                  </p>
                )}
              </div>

              {/* Address details grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoField
                  label="CEP"
                  value={formatCep(customer.zipCode)}
                  mono
                />
                <InfoField
                  icon={MapPin}
                  label="Cidade"
                  value={
                    hasValue(customer.city) && hasValue(customer.state)
                      ? `${customer.city} - ${customer.state}`
                      : customer.city || "Não informado"
                  }
                />
                <InfoField icon={Globe} label="País" value={customer.country} />
                <InfoField
                  label="Cód. Município / UF"
                  value={
                    customer.municipalityCode
                      ? `${customer.municipalityCode} / ${customer.stateCode}`
                      : "Não informado"
                  }
                  mono
                />
              </div>
            </div>
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
