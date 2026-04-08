"use client";

import {
  AlertCircle,
  Building2,
  Loader2,
  MapPin,
  Plus,
  Search,
  User,
} from "lucide-react";
import Form from "next/form";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  fetchAddressByCep,
  formatCep,
  validateCep,
} from "@/services/api-cep/cep-service";

import { createCustomerAction } from "../actions/create-customer-action";
import { BUDGET_FLOW_STEPS } from "../budget-flow";

function formatCepInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

export function CustomerCreateDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(
    createCustomerAction,
    null,
  );
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const navigatedRef = useRef(false);

  const [personType, setPersonType] = useState<"1" | "2">(
    (state?.fieldValues?.pe_person_type_id as "1" | "2") || "1",
  );

  const [cepValue, setCepValue] = useState(
    state?.fieldValues?.pe_zip_code || "",
  );
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [addressFields, setAddressFields] = useState({
    pe_address: state?.fieldValues?.pe_address || "",
    pe_address_number: state?.fieldValues?.pe_address_number || "",
    pe_complement: state?.fieldValues?.pe_complement || "",
    pe_neighborhood: state?.fieldValues?.pe_neighborhood || "",
    pe_city: state?.fieldValues?.pe_city || "",
    pe_state: state?.fieldValues?.pe_state || "",
  });

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      navigatedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (navigatedRef.current) return;
    if (state?.success && state.data?.customerId) {
      navigatedRef.current = true;
      toast.success(state.message);
      dialogCloseRef.current?.click();

      const params = new URLSearchParams(searchParams.toString());
      params.set("step", String(BUDGET_FLOW_STEPS.cart));
      params.set("customerId", String(state.data.customerId));
      params.delete("orderId");
      params.delete("search");
      router.push(`/dashboard/order/new-budget?${params.toString()}`);
    }
  }, [state, searchParams, router]);

  async function handleLookupCep() {
    if (isCepLoading || isPending) return;

    if (!validateCep(cepValue)) {
      setCepMessage({
        type: "error",
        text: "Informe um CEP com 8 dígitos.",
      });
      return;
    }

    setIsCepLoading(true);
    setCepMessage(null);

    try {
      const data = await fetchAddressByCep(cepValue);

      if (!data) {
        setCepMessage({
          type: "error",
          text: "Não foi possível localizar o endereço para este CEP.",
        });
        return;
      }

      setCepValue(formatCep(data.cep || cepValue));
      setAddressFields({
        pe_address: data.street || addressFields.pe_address,
        pe_address_number: addressFields.pe_address_number,
        pe_complement: data.complement || addressFields.pe_complement,
        pe_neighborhood: data.neighborhood || addressFields.pe_neighborhood,
        pe_city: data.city || addressFields.pe_city,
        pe_state: data.state || addressFields.pe_state,
      });

      setCepMessage({
        type: "success",
        text: "Endereço preenchido. Revise os dados e salve.",
      });
    } catch (error) {
      setCepMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao buscar o CEP.",
      });
    } finally {
      setIsCepLoading(false);
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Cadastre um cliente para vinculá-lo ao orçamento.
          </DialogDescription>
        </DialogHeader>

        <Form
          action={formAction}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
            {state?.success === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            {/* Seção 1: Identificação */}
            <fieldset className="space-y-3">
              <legend className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Identificação
              </legend>

              <div className="space-y-1.5">
                <Label htmlFor="pe_name">Nome *</Label>
                <Input
                  id="pe_name"
                  name="pe_name"
                  placeholder="Nome completo"
                  required
                  disabled={isPending}
                  defaultValue={state?.fieldValues?.pe_name}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Tipo de Pessoa *</Label>
                <input type="hidden" name="pe_person_type_id" value={personType} />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPersonType("1")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      personType === "1"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <User className="h-4 w-4" />
                    Pessoa Física
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersonType("2")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      personType === "2"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    Pessoa Jurídica
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pe_cpf">CPF</Label>
                  <Input
                    id="pe_cpf"
                    name="pe_cpf"
                    placeholder="000.000.000-00"
                    disabled={isPending || personType === "2"}
                    defaultValue={state?.fieldValues?.pe_cpf}
                    className={cn("h-9", personType === "2" && "opacity-50")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pe_cnpj">CNPJ</Label>
                  <Input
                    id="pe_cnpj"
                    name="pe_cnpj"
                    placeholder="00.000.000/0000-00"
                    disabled={isPending || personType === "1"}
                    defaultValue={state?.fieldValues?.pe_cnpj}
                    className={cn("h-9", personType === "1" && "opacity-50")}
                  />
                </div>
              </div>
            </fieldset>

            {/* Seção 2: Contato */}
            <fieldset className="space-y-3">
              <legend className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Contato
              </legend>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pe_phone">Telefone</Label>
                  <Input
                    id="pe_phone"
                    name="pe_phone"
                    placeholder="(00) 0000-0000"
                    disabled={isPending}
                    defaultValue={state?.fieldValues?.pe_phone}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pe_whatsapp">WhatsApp</Label>
                  <Input
                    id="pe_whatsapp"
                    name="pe_whatsapp"
                    placeholder="(00) 00000-0000"
                    disabled={isPending}
                    defaultValue={state?.fieldValues?.pe_whatsapp}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pe_email">E-mail *</Label>
                <Input
                  id="pe_email"
                  name="pe_email"
                  type="email"
                  placeholder="email@exemplo.com"
                  required
                  disabled={isPending}
                  defaultValue={state?.fieldValues?.pe_email}
                  className="h-9"
                />
              </div>
            </fieldset>

            {/* Seção 3: Endereço */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <MapPin className="h-3 w-3" />
                Endereço
              </legend>

              <div className="flex gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Label htmlFor="pe_zip_code">CEP</Label>
                  <Input
                    id="pe_zip_code"
                    name="pe_zip_code"
                    inputMode="numeric"
                    placeholder="00000-000"
                    disabled={isPending || isCepLoading}
                    value={cepValue}
                    onChange={(e) => {
                      setCepValue(formatCepInput(e.target.value));
                      setCepMessage(null);
                    }}
                    className="h-9 font-mono tracking-wide"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending || isCepLoading}
                    className="h-9"
                    onClick={handleLookupCep}
                  >
                    {isCepLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-1.5 hidden sm:inline">Buscar</span>
                  </Button>
                </div>
              </div>
              {cepMessage && (
                <p
                  className={cn(
                    "text-xs",
                    cepMessage.type === "success"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-destructive",
                  )}
                >
                  {cepMessage.text}
                </p>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="pe_address">Endereço</Label>
                  <Input
                    id="pe_address"
                    name="pe_address"
                    placeholder="Rua, avenida..."
                    disabled={isPending}
                    value={addressFields.pe_address}
                    onChange={(e) =>
                      setAddressFields((prev) => ({
                        ...prev,
                        pe_address: e.target.value,
                      }))
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pe_address_number">Número</Label>
                  <Input
                    id="pe_address_number"
                    name="pe_address_number"
                    placeholder="Nº"
                    disabled={isPending}
                    value={addressFields.pe_address_number}
                    onChange={(e) =>
                      setAddressFields((prev) => ({
                        ...prev,
                        pe_address_number: e.target.value,
                      }))
                    }
                    className="h-9 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pe_complement">Complemento</Label>
                  <Input
                    id="pe_complement"
                    name="pe_complement"
                    placeholder="Apto, bloco..."
                    disabled={isPending}
                    value={addressFields.pe_complement}
                    onChange={(e) =>
                      setAddressFields((prev) => ({
                        ...prev,
                        pe_complement: e.target.value,
                      }))
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pe_neighborhood">Bairro</Label>
                  <Input
                    id="pe_neighborhood"
                    name="pe_neighborhood"
                    placeholder="Bairro"
                    disabled={isPending}
                    value={addressFields.pe_neighborhood}
                    onChange={(e) =>
                      setAddressFields((prev) => ({
                        ...prev,
                        pe_neighborhood: e.target.value,
                      }))
                    }
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="pe_city">Cidade</Label>
                  <Input
                    id="pe_city"
                    name="pe_city"
                    placeholder="Cidade"
                    disabled={isPending}
                    value={addressFields.pe_city}
                    onChange={(e) =>
                      setAddressFields((prev) => ({
                        ...prev,
                        pe_city: e.target.value,
                      }))
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pe_state">UF</Label>
                  <Input
                    id="pe_state"
                    name="pe_state"
                    placeholder="UF"
                    maxLength={2}
                    disabled={isPending}
                    value={addressFields.pe_state}
                    onChange={(e) =>
                      setAddressFields((prev) => ({
                        ...prev,
                        pe_state: e.target.value,
                      }))
                    }
                    className="h-9 font-mono uppercase"
                  />
                </div>
              </div>
            </fieldset>

            {/* Seção 4: Observações */}
            <fieldset className="space-y-3">
              <legend className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Observações
              </legend>
              <Textarea
                id="pe_notes"
                name="pe_notes"
                placeholder="Anotações sobre o cliente..."
                rows={2}
                disabled={isPending}
                defaultValue={state?.fieldValues?.pe_notes}
                className="resize-none"
              />
            </fieldset>
          </div>

          {/* Footer fixo */}
          <div className="shrink-0 border-t px-5 py-3">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Cliente
            </Button>
          </div>
        </Form>

        <button ref={dialogCloseRef} type="button" className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
