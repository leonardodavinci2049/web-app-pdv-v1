"use client";

import { Pencil } from "lucide-react";
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
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { updateBrandAction } from "../_actions/update-brand";
import { BrandForm } from "./brand-form";

interface BrandUpdateDialogProps {
  brand: UIBrand;
}

export function BrandUpdateDialog({ brand }: BrandUpdateDialogProps) {
  const [open, setOpen] = useState(false);

  const initialData = {
    brand_id: brand.id,
    brand: brand.name,
    slug: brand.slug ?? "",
    image_path: brand.imagePath ?? "",
    notes: brand.notes ?? "",
    inactive: brand.inactive ? 1 : 0,
  };

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Marca</DialogTitle>
          <DialogDescription>
            Altere os dados da marca {brand.name}.
          </DialogDescription>
        </DialogHeader>
        <BrandForm
          mode="update"
          initialData={initialData}
          action={updateBrandAction}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
