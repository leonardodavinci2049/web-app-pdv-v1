"use client";

import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { getBrandByIdAction } from "../_actions/get-brand";
import { updateBrandAction } from "../_actions/update-brand";
import { BrandForm } from "./brand-form";

interface BrandUpdateDialogProps {
  brand: UIBrand;
}

export function BrandUpdateDialog({ brand }: BrandUpdateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandDetails, setBrandDetails] = useState<UIBrand | null>(null);

  const loadBrandDetails = async () => {
    setLoading(true);
    try {
      const details = await getBrandByIdAction(brand.id);
      if (details) {
        setBrandDetails(details);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes da marca:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      loadBrandDetails();
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  const initialData = {
    brand_id: brandDetails?.id || brand.id,
    brand: brandDetails?.name || brand.name,
    image_path: brandDetails?.imagePath ?? "",
    notes: brandDetails?.notes ?? "",
    inactive: brandDetails?.inactive ? 1 : 0,
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Marca</DialogTitle>
          <DialogDescription>
            Altere os dados da marca {brand.name} (ID: {brand.id}).
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <BrandForm
            mode="update"
            initialData={initialData}
            action={updateBrandAction}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
