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
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UICustomerDetail } from "@/services/api-main/customer-general/transformers/transformers";

interface CustomerDetailSectionsProps {
  customer: UICustomerDetail;
}

function hasValue(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string")
    return value.trim() !== "" && value.trim() !== "0";
  return value !== 0;
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

export function CustomerDetailSections({
  customer,
}: CustomerDetailSectionsProps) {
  const isPessoaFisica = customer.personTypeId === 1;
  const isPessoaJuridica = customer.personTypeId === 2;

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 md:grid-cols-2">
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
              icon={Calendar}
              label="Data de Nascimento"
              value={formatDate(customer.birthDate || null)}
            />
          </div>
          {isPessoaFisica && (
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-violet-500/5 px-3 py-1.5 text-[11px] font-medium text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <BadgeCheck className="h-3.5 w-3.5" />
              Tipo de conta ativa: Pessoa Física
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={Building2}
          title="Pessoa Jurídica"
          accentColor="amber"
          className={cn(!isPessoaJuridica && "opacity-50")}
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Razão Social" value={customer.companyName} />
              <InfoField
                label="Nome Fantasia"
                value={customer.tradeName || ""}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField
                icon={Hash}
                label="CNPJ"
                value={formatCnpj(customer.cnpj || "")}
                mono
              />
              <InfoField
                label="Inscrição Estadual"
                value={
                  hasValue(customer.stateRegistration)
                    ? customer.stateRegistration || "Não informado"
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

      <SectionCard icon={MapPin} title="Endereço" accentColor="sky">
        <div className="space-y-4">
          <div className="rounded-xl border border-sky-500/10 bg-sky-500/[0.03] px-4 py-3 dark:bg-sky-500/[0.06]">
            <p className="text-sm font-medium text-foreground">
              {hasValue(customer.address) ? (
                <>
                  {customer.address}
                  {hasValue(customer.addressNumber) &&
                    `, ${customer.addressNumber}`}
                  {hasValue(customer.complement) && ` - ${customer.complement}`}
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoField
              label="CEP"
              value={formatCep(customer.zipCode || "")}
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
            <InfoField
              icon={Globe}
              label="País"
              value={customer.country || ""}
            />
            <InfoField
              label="Cód. Município / UF"
              value={
                customer.cityCode
                  ? `${customer.cityCode} / ${customer.stateCode}`
                  : "Não informado"
              }
              mono
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={Clock3}
        title="Informações Complementares"
        accentColor="primary"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoField
            icon={Calendar}
            label="Cliente desde"
            value={formatDate(customer.createdAt)}
          />
          <InfoField
            icon={User}
            label="Vendedor ID"
            value={String(customer.sellerId)}
            mono
          />
        </div>
      </SectionCard>
    </div>
  );
}
