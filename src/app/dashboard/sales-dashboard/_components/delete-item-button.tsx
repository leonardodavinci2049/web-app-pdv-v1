"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteItemAction } from "../actions/delete-item-action";

interface DeleteItemButtonProps {
  movementId: number;
  productName: string;
}

export function DeleteItemButton({
  movementId,
  productName,
}: DeleteItemButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    toast.warning(`Excluir "${productName}"?`, {
      description: "Esta ação não pode ser desfeita.",
      action: {
        label: "Excluir",
        onClick: () => {
          startTransition(async () => {
            const result = await deleteItemAction(movementId);
            if (result.success) {
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
          });
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full border border-border/60 bg-background/90 text-muted-foreground opacity-100 backdrop-blur transition-opacity hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
      disabled={isPending}
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
