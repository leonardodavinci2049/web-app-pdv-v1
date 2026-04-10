"use client";

import {
  Building2,
  Loader2,
  MapPin,
  Phone,
  StickyNote,
  User,
} from "lucide-react";
import Form from "next/form";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/action-types";
import { createCustomerAction } from "../actions/create-customer-action";
import { type CepAddressData, CepLookup } from "./cep-lookup";
import { type PersonType, PersonTypeSelector } from "./person-type-selector";
import { StateSelect } from "./state-select";

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length > 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  if (digits.length > 3) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  return digits;
}

function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length > 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  if (digits.length > 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  if (digits.length > 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }
  return digits;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length > 2) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return digits;
}

export function CustomerForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createCustomerAction,
    null,
  );

  const [personType, setPersonType] = useState<PersonType>("fisica");
  const [cpf, setCpf] = useState(state?.fieldValues?.pe_cpf || "");
  const [cnpj, setCnpj] = useState(state?.fieldValues?.pe_cnpj || "");
  const [phone, setPhone] = useState(state?.fieldValues?.pe_phone || "");
  const [whatsapp, setWhatsapp] = useState(
    state?.fieldValues?.pe_whatsapp || "",
  );
  const [cep, setCep] = useState(state?.fieldValues?.pe_zip_code || "");
  const [endereco, setEndereco] = useState(
    state?.fieldValues?.pe_address || "",
  );
  const [numero, setNumero] = useState(
    state?.fieldValues?.pe_address_number || "",
  );
  const [complemento, setComplemento] = useState(
    state?.fieldValues?.pe_complement || "",
  );
  const [bairro, setBairro] = useState(
    state?.fieldValues?.pe_neighborhood || "",
  );
  const [cidade, setCidade] = useState(state?.fieldValues?.pe_city || "");
  const [uf, setUf] = useState(state?.fieldValues?.pe_state || "");

  const handleAddressFound = (address: CepAddressData) => {
    setEndereco(address.street);
    setBairro(address.neighborhood);
    setCidade(address.city);
    setUf(address.state);
  };

  const personTypeId = personType === "fisica" ? 1 : 2;

  return (
    <div className="space-y-6">
      {/* Feedback message */}
      {state?.message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            state.success
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {state.message}
        </div>
      )}

      <Form action={formAction} className="space-y-6">
        {/* Hidden fields */}
        <input type="hidden" name="pe_person_type_id" value={personTypeId} />
        <input type="hidden" name="pe_complement" value={complemento} />
        <input type="hidden" name="pe_neighborhood" value={bairro} />

        {/* ── Tipo de Pessoa ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Tipo de Cadastro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PersonTypeSelector
              value={personType}
              onChange={setPersonType}
              disabled={isPending}
            />
          </CardContent>
        </Card>

        {/* ── Dados do Cliente ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              {personType === "juridica" ? (
                <Building2 className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
              {personType === "juridica"
                ? "Dados da Empresa"
                : "Dados Pessoais"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="pe_name">
                Nome {personType === "juridica" ? "Fantasia" : "Completo"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pe_name"
                name="pe_name"
                placeholder={
                  personType === "juridica"
                    ? "Nome fantasia da empresa"
                    : "Nome completo do cliente"
                }
                required
                disabled={isPending}
                defaultValue={state?.fieldValues?.pe_name}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="pe_email">
                E-mail <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pe_email"
                name="pe_email"
                type="email"
                placeholder="email@exemplo.com"
                required
                disabled={isPending}
                defaultValue={state?.fieldValues?.pe_email}
              />
            </div>

            <Separator />

            {/* Campos por tipo de pessoa */}
            {personType === "fisica" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pe_cpf">CPF</Label>
                  <Input
                    id="pe_cpf"
                    name="pe_cpf"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    disabled={isPending}
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pe_cnpj">CNPJ</Label>
                  <Input
                    id="pe_cnpj"
                    name="pe_cnpj"
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    disabled={isPending}
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pe_company_name">Razão Social</Label>
                  <Input
                    id="pe_company_name"
                    name="pe_company_name"
                    placeholder="Razão social da empresa"
                    disabled={isPending}
                    defaultValue={state?.fieldValues?.pe_company_name}
                  />
                </div>
              </div>
            )}

            {/* Imagem de perfil */}
            <div className="space-y-2">
              <Label htmlFor="pe_image">URL da Imagem (opcional)</Label>
              <Input
                id="pe_image"
                name="pe_image"
                type="url"
                placeholder="https://exemplo.com/foto.jpg"
                disabled={isPending}
                defaultValue={state?.fieldValues?.pe_image}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Contato ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pe_phone">Telefone</Label>
                <Input
                  id="pe_phone"
                  name="pe_phone"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  disabled={isPending}
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pe_whatsapp">WhatsApp</Label>
                <Input
                  id="pe_whatsapp"
                  name="pe_whatsapp"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  disabled={isPending}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Endereço ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CEP */}
            <div className="max-w-xs">
              <CepLookup
                value={cep}
                onChange={setCep}
                onAddressFound={handleAddressFound}
                disabled={isPending}
              />
            </div>

            {/* Endereço + Número */}
            <div className="grid gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-8">
                <Label htmlFor="pe_address">Endereço</Label>
                <Input
                  id="pe_address"
                  name="pe_address"
                  placeholder="Rua, Avenida, etc."
                  disabled={isPending}
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label htmlFor="pe_address_number">Número</Label>
                <Input
                  id="pe_address_number"
                  name="pe_address_number"
                  placeholder="123"
                  disabled={isPending}
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                />
              </div>
            </div>

            {/* Complemento + Bairro */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  placeholder="Apto, Bloco, Sala, etc."
                  disabled={isPending}
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  placeholder="Nome do bairro"
                  disabled={isPending}
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                />
              </div>
            </div>

            {/* Cidade + Estado */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pe_city">Cidade</Label>
                <Input
                  id="pe_city"
                  name="pe_city"
                  placeholder="Nome da cidade"
                  disabled={isPending}
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
              </div>
              <StateSelect value={uf} onChange={setUf} disabled={isPending} />
            </div>
          </CardContent>
        </Card>

        {/* ── Observações ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <StickyNote className="h-4 w-4" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="pe_notes"
              name="pe_notes"
              placeholder="Informações adicionais, preferências, observações..."
              rows={4}
              disabled={isPending}
              defaultValue={state?.fieldValues?.pe_notes}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-35">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Cliente"
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
