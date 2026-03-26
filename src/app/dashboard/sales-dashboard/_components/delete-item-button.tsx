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
      size="icon-xs"
      className="shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={handleDelete}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
