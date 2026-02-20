"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createBrandAction } from "../_actions/create-brand";
import { BrandForm } from "./brand-form";

export function BrandCreateDialog() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Marca
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Marca</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para cadastrar uma nova marca.
          </DialogDescription>
        </DialogHeader>
        <BrandForm
          mode="create"
          onSuccess={handleSuccess}
          action={createBrandAction}
        />
      </DialogContent>
    </Dialog>
  );
}
