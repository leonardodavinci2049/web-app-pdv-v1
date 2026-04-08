"use client";

import {
  Check,
  Globe,
  Hash,
  Loader2,
  type LucideIcon,
  MapPin,
  PencilLine,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  fetchAddressByCep,
  formatCep as formatCepValue,
  validateCep,
} from "@/services/api-cep/cep-service";
import type { UIOrderCustomer } from "@/services/api-main/order-sales/transformers/transformers";
import { updateCustomerAddressAction } from "../actions/update-customer-address-action";

type AddressFormValues = {
  zipCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  municipalityCode: string;
  stateCode: string;
};

const EDITABLE_ORDER_STATUS_ID = 22;

const ADDRESS_FIELDS: Array<{
  key: keyof AddressFormValues;
  label: string;
  icon?: LucideIcon;
  placeholder: string;
  mono?: boolean;
  inputMode?: React.ComponentProps<typeof Input>["inputMode"];
}> = [
  {
    key: "address",
    label: "Endereço",
    icon: MapPin,
    placeholder: "Rua, avenida ou logradouro",
  },
  {
    key: "addressNumber",
    label: "Número",
    icon: Hash,
    placeholder: "Número do endereço",
    mono: true,
  },
  {
    key: "complement",
    label: "Complemento",
    placeholder: "Apto, bloco, referência",
  },
  {
    key: "neighborhood",
    label: "Bairro",
    placeholder: "Bairro",
  },
  {
    key: "city",
    label: "Cidade",
    placeholder: "Cidade",
  },
  {
    key: "state",
    label: "UF",
    placeholder: "UF",
    mono: true,
  },
  {
    key: "municipalityCode",
    label: "Cód. Município",
    placeholder: "Código IBGE do município",
    mono: true,
    inputMode: "numeric",
  },
  {
    key: "stateCode",
    label: "Cód. UF",
    placeholder: "Código da UF",
    mono: true,
    inputMode: "numeric",
  },
];

function hasValue(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    return value.trim() !== "" && value.trim() !== "0";
  }

  return value !== 0;
}

function formatCep(cep: string): string {
  if (!cep || cep.length !== 8) return cep || "Não informado";
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
}

function formatCepInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return digits;
}

function getInitialValues(customer: UIOrderCustomer): AddressFormValues {
  return {
    zipCode: customer.zipCode ?? "",
    address: customer.address ?? "",
    addressNumber: customer.addressNumber ?? "",
    complement: customer.complement ?? "",
    neighborhood: customer.neighborhood ?? "",
    city: customer.city ?? "",
    state: customer.state ?? "",
    municipalityCode: hasValue(customer.municipalityCode)
      ? String(customer.municipalityCode)
      : "",
    stateCode: hasValue(customer.stateCode) ? String(customer.stateCode) : "",
  };
}

function InfoField({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon?: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
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

function isSameAddress(
  currentValues: AddressFormValues,
  initialValues: AddressFormValues,
): boolean {
  return JSON.stringify(currentValues) === JSON.stringify(initialValues);
}

interface CustomerAddressInlineSectionProps {
  customer: UIOrderCustomer;
  orderId: number;
  orderStatusId: number;
}

export function CustomerAddressInlineSection({
  customer,
  orderId,
  orderStatusId,
}: CustomerAddressInlineSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCepLookupLoading, setIsCepLookupLoading] = useState(false);
  const [cepLookupMessage, setCepLookupMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [values, setValues] = useState<AddressFormValues>(() =>
    getInitialValues(customer),
  );

  const initialValues = getInitialValues(customer);
  const canEdit =
    customer.customerId > 0 &&
    orderId > 0 &&
    orderStatusId === EDITABLE_ORDER_STATUS_ID;

  useEffect(() => {
    setValues(getInitialValues(customer));
    setCepLookupMessage(null);
  }, [customer]);

  useEffect(() => {
    if (!canEdit) {
      setIsEditing(false);
    }
  }, [canEdit]);

  function handleChange(key: keyof AddressFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: key === "zipCode" ? formatCepInput(value) : value,
    }));

    if (key === "zipCode") {
      setCepLookupMessage(null);
    }
  }

  function handleCancel() {
    setValues(initialValues);
    setCepLookupMessage(null);
    setIsEditing(false);
  }

  async function handleLookupCep() {
    if (isCepLookupLoading || isPending) {
      return;
    }

    if (!validateCep(values.zipCode)) {
      setCepLookupMessage({
        type: "error",
        text: "Informe um CEP com 8 dígitos para buscar o endereço.",
      });
      return;
    }

    setIsCepLookupLoading(true);
    setCepLookupMessage(null);

    try {
      const addressData = await fetchAddressByCep(values.zipCode);

      if (!addressData) {
        setCepLookupMessage({
          type: "error",
          text: "Não foi possível localizar o endereço para este CEP.",
        });
        return;
      }

      setValues((currentValues) => ({
        ...currentValues,
        zipCode: formatCepValue(addressData.cep || currentValues.zipCode),
        address: addressData.street || currentValues.address,
        complement: addressData.complement || currentValues.complement,
        neighborhood: addressData.neighborhood || currentValues.neighborhood,
        city: addressData.city || currentValues.city,
        state: addressData.state || currentValues.state,
        municipalityCode:
          addressData.municipalityCode || currentValues.municipalityCode,
        stateCode: addressData.stateCode || currentValues.stateCode,
      }));

      setCepLookupMessage({
        type: "success",
        text: "Endereço preenchido a partir do CEP. Revise os dados e salve para gravar.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao buscar o CEP.";

      setCepLookupMessage({
        type: "error",
        text: message,
      });
    } finally {
      setIsCepLookupLoading(false);
    }
  }

  function handleSave() {
    if (!canEdit || isPending) {
      return;
    }

    if (isSameAddress(values, initialValues)) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateCustomerAddressAction(
          orderId,
          customer.customerId,
          values,
        );

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setIsEditing(false);
        router.refresh();
      } catch (_error) {
        toast.error("Erro inesperado ao atualizar endereco do cliente");
      }
    });
  }

  return (
    <div className="group/address-field space-y-4">
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || isCepLookupLoading}
              className="rounded-full"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isPending || isCepLookupLoading}
              className="rounded-full"
              onClick={handleSave}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </>
        ) : (
          canEdit && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-muted-foreground opacity-40 transition-opacity hover:text-foreground [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/address-field:opacity-100"
              onClick={() => setIsEditing(true)}
              title="Editar endereço"
            >
              <PencilLine className="h-3.5 w-3.5" />
              Editar
            </button>
          )
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/8 px-4 py-3 dark:bg-sky-500/10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="min-w-0 flex-1">
                <Label
                  htmlFor="customer-address-zip-code"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700/80 dark:text-sky-300/80"
                >
                  CEP
                </Label>
                <Input
                  id="customer-address-zip-code"
                  value={values.zipCode}
                  inputMode="numeric"
                  placeholder="00000-000"
                  disabled={isPending || isCepLookupLoading}
                  className="mt-2 h-11 rounded-xl border-sky-500/20 bg-background/90 font-mono text-base font-semibold tracking-[0.2em] shadow-none dark:bg-background/40"
                  onChange={(event) =>
                    handleChange("zipCode", event.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={isPending || isCepLookupLoading}
                className="h-11 rounded-xl border-sky-500/20 bg-background/80 px-4 dark:bg-background/40"
                onClick={handleLookupCep}
              >
                {isCepLookupLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando CEP...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Buscar CEP
                  </>
                )}
              </Button>
            </div>
            {cepLookupMessage && (
              <p
                className={cn(
                  "mt-2 text-xs",
                  cepLookupMessage.type === "success"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-destructive",
                )}
              >
                {cepLookupMessage.text}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ADDRESS_FIELDS.map((field) => {
              const Icon = field.icon;
              const inputId = `customer-address-${field.key}`;

              return (
                <div key={field.key} className="space-y-1.5">
                  <Label
                    htmlFor={inputId}
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80"
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {field.label}
                  </Label>
                  <Input
                    id={inputId}
                    value={values[field.key]}
                    placeholder={field.placeholder}
                    inputMode={field.inputMode}
                    disabled={isPending}
                    className={cn(
                      "h-10 rounded-xl border-border/70 bg-background/80 shadow-none dark:bg-background/40",
                      field.mono && "font-mono tracking-wide",
                    )}
                    onChange={(event) =>
                      handleChange(field.key, event.target.value)
                    }
                  />
                </div>
              );
            })}

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                <Globe className="h-3 w-3" />
                País
              </Label>
              <Input
                value={customer.country || "Não informado"}
                readOnly
                disabled
                className="h-10 rounded-xl border-border/70 bg-muted/30 text-muted-foreground shadow-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/8 px-4 py-3 dark:bg-sky-500/10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700/80 dark:text-sky-300/80">
              CEP
            </div>
            <p className="mt-1 font-mono text-lg font-semibold tracking-[0.2em] text-foreground">
              {formatCep(customer.zipCode)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <InfoField
              icon={MapPin}
              label="Endereço"
              value={customer.address}
            />
            <InfoField
              icon={Hash}
              label="Número"
              value={customer.addressNumber}
              mono
            />
            <InfoField label="Complemento" value={customer.complement} />
            <InfoField label="Bairro" value={customer.neighborhood} />
            <InfoField label="Cidade" value={customer.city} />
            <InfoField label="UF" value={customer.state} mono />
            <InfoField icon={Globe} label="País" value={customer.country} />
            <InfoField
              label="Cód. Município"
              value={
                hasValue(customer.municipalityCode)
                  ? String(customer.municipalityCode)
                  : ""
              }
              mono
            />
            <InfoField
              label="Cód. UF"
              value={
                hasValue(customer.stateCode) ? String(customer.stateCode) : ""
              }
              mono
            />
          </div>

          {/* <div className="rounded-xl border border-sky-500/10 bg-sky-500/3 px-4 py-3 dark:bg-sky-500/6">
            <p className="text-sm font-medium text-foreground">
              {hasValue(customer.address) ? (
                <>
                  {customer.address}
                  {hasValue(customer.addressNumber)
                    ? `, ${customer.addressNumber}`
                    : ""}
                  {hasValue(customer.complement)
                    ? ` - ${customer.complement}`
                    : ""}
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
          </div> */}
        </>
      )}
    </div>
  );
}
