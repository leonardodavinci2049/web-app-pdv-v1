"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { closeOrderAction } from "../actions/close-order-action";

interface FinalizeSaleButtonProps {
  orderId: number;
  orderStatusId: number;
  disabled?: boolean;
}

const CLOSEABLE_ORDER_STATUS_ID = 22;

export function FinalizeSaleButton({
  orderId,
  orderStatusId,
  disabled = false,
}: FinalizeSaleButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canFinalize =
    !disabled && orderId > 0 && orderStatusId === CLOSEABLE_ORDER_STATUS_ID;

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const result = await closeOrderAction(orderId);

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          router.refresh();
          return;
        }

        toast.error(result.message);
      } catch (_error) {
        toast.error("Erro inesperado ao finalizar pedido");
      }
    });
  };

  const buttonClassName = cn(
    "h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-black/10 hover:bg-primary/90",
    !canFinalize && "opacity-60",
  );

  if (!canFinalize) {
    return (
      <div className="cursor-not-allowed">
        <Button type="button" size="lg" disabled className={buttonClassName}>
          Finalizar venda
        </Button>
      </div>
    );
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) {
          setOpen(nextOpen);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button type="button" size="lg" className={buttonClassName}>
          Finalizar venda
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar finalização da venda</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja finalizar esta venda? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleConfirm();
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finalizando...
              </>
            ) : (
              "Confirmar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
