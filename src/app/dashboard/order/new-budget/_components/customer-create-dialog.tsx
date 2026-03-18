"use client";

import { Loader2, Plus } from "lucide-react";
import Form from "next/form";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import { createCustomerAction } from "../actions/create-customer-action";

export function CustomerCreateDialog() {
  const [state, formAction, isPending] = useActionState(
    createCustomerAction,
    null,
  );
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      dialogCloseRef.current?.click();
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>

        <Form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pe_name">Nome *</Label>
            <Input
              id="pe_name"
              name="pe_name"
              placeholder="Nome completo"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pe_email">E-mail *</Label>
            <Input
              id="pe_email"
              name="pe_email"
              type="email"
              placeholder="email@exemplo.com"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pe_person_type_id">Tipo de Pessoa *</Label>
            <Select name="pe_person_type_id" defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Pessoa Física</SelectItem>
                <SelectItem value="2">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pe_cpf">CPF</Label>
              <Input
                id="pe_cpf"
                name="pe_cpf"
                placeholder="000.000.000-00"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pe_cnpj">CNPJ</Label>
              <Input
                id="pe_cnpj"
                name="pe_cnpj"
                placeholder="00.000.000/0000-00"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pe_phone">Telefone</Label>
              <Input
                id="pe_phone"
                name="pe_phone"
                placeholder="(00) 0000-0000"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pe_whatsapp">WhatsApp</Label>
              <Input
                id="pe_whatsapp"
                name="pe_whatsapp"
                placeholder="(00) 00000-0000"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pe_notes">Observações</Label>
            <Textarea
              id="pe_notes"
              name="pe_notes"
              placeholder="Anotações sobre o cliente..."
              disabled={isPending}
            />
          </div>

          <div className="pt-2">
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
