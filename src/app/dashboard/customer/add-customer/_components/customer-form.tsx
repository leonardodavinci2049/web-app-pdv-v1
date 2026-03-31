"use client";

import { Loader2 } from "lucide-react";
import Form from "next/form";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/action-types";
import { createCustomerAction } from "../actions/create-customer-action";

interface CustomerFormProps {
  initialFieldValues?: Record<string, string>;
}

export function CustomerForm({ initialFieldValues }: CustomerFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createCustomerAction,
    null,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {state?.message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            state.success
              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {state.message}
        </div>
      )}

      <Form action={formAction} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pe_name">Nome *</Label>
            <Input
              id="pe_name"
              name="pe_name"
              placeholder="Nome completo"
              required
              disabled={isPending}
              defaultValue={
                state?.fieldValues?.pe_name || initialFieldValues?.pe_name
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pe_email">E-mail *</Label>
            <Input
              id="pe_email"
              name="pe_email"
              type="email"
              placeholder="email@exemplo.com"
              required
              disabled={isPending}
              defaultValue={
                state?.fieldValues?.pe_email || initialFieldValues?.pe_email
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pe_person_type_id">Tipo de Pessoa *</Label>
            <Select
              name="pe_person_type_id"
              defaultValue={
                state?.fieldValues?.pe_person_type_id ||
                initialFieldValues?.pe_person_type_id ||
                "1"
              }
            >
              <SelectTrigger disabled={isPending}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Pessoa Física</SelectItem>
                <SelectItem value="2">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pe_cpf">CPF</Label>
              <Input
                id="pe_cpf"
                name="pe_cpf"
                placeholder="000.000.000-00"
                disabled={isPending}
                defaultValue={
                  state?.fieldValues?.pe_cpf || initialFieldValues?.pe_cpf
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pe_cnpj">CNPJ</Label>
              <Input
                id="pe_cnpj"
                name="pe_cnpj"
                placeholder="00.000.000/0000-00"
                disabled={isPending}
                defaultValue={
                  state?.fieldValues?.pe_cnpj || initialFieldValues?.pe_cnpj
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pe_phone">Telefone</Label>
              <Input
                id="pe_phone"
                name="pe_phone"
                placeholder="(00) 0000-0000"
                disabled={isPending}
                defaultValue={
                  state?.fieldValues?.pe_phone || initialFieldValues?.pe_phone
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pe_whatsapp">WhatsApp</Label>
              <Input
                id="pe_whatsapp"
                name="pe_whatsapp"
                placeholder="(00) 00000-0000"
                disabled={isPending}
                defaultValue={
                  state?.fieldValues?.pe_whatsapp ||
                  initialFieldValues?.pe_whatsapp
                }
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pe_notes">Observações</Label>
            <Textarea
              id="pe_notes"
              name="pe_notes"
              placeholder="Anotações sobre o cliente..."
              rows={4}
              disabled={isPending}
              defaultValue={
                state?.fieldValues?.pe_notes || initialFieldValues?.pe_notes
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Cliente
          </Button>
        </div>
      </Form>
    </div>
  );
}
