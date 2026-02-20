"use client";

import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getBrandAction } from "../_actions/get-brand";
import { updateBrandAction } from "../_actions/update-brand";
import { BrandForm } from "./brand-form";

type InitialData = {
  brand_id?: number;
  brand?: string;
  slug?: string;
  image_path?: string;
  notes?: string;
  inactive?: number;
};

interface BrandUpdateDialogProps {
  brandId: number;
  brandName: string;
}

export function BrandUpdateDialog({
  brandId,
  brandName,
}: BrandUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const router = useRouter();

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setLoading(true);
      try {
        const data = await getBrandAction(brandId);
        if (data) {
          setInitialData(data);
        } else {
          toast.error("Não foi possível carregar os dados da marca.");
          setOpen(false);
        }
      } catch (_error) {
        toast.error("Erro ao carregar dados.");
        setOpen(false);
      } finally {
        setLoading(false);
      }
    } else {
      setInitialData(null); // Reset on close
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
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
            Altere os dados da marca {brandName}.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          initialData && (
            <BrandForm
              mode="update"
              initialData={initialData}
              action={updateBrandAction}
              onSuccess={handleSuccess}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
