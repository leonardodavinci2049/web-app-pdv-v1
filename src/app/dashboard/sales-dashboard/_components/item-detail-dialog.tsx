"use client";

import { Check, Eye, Loader2, Package, Pencil, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/common-utils";
import { updateItemFieldAction } from "../actions/update-item-field-action";

interface ItemDetailDialogProps {
  item: {
    movementId: number;
    product: string;
    imagePath: string;
    unitValue: string;
    discountValue: string;
    additionValue: string;
    quantity: number;
    totalValue: string;
  };
  isEditable?: boolean;
}

export function ItemDetailDialog({
  item,
  isEditable = false,
}: ItemDetailDialogProps) {
  const [open, setOpen] = useState(false);

  const unitValue = Number(item.unitValue);
  const discountValue = Number(item.discountValue);
  const surchargeValue = Number(item.additionValue);
  const totalValue = Number(item.totalValue);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Detalhe do item</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            {/* Product image */}
            {item.imagePath ? (
              <div className="relative h-36 w-36 overflow-hidden rounded-xl border border-border/60 bg-muted/50">
                <Image
                  src={item.imagePath}
                  alt={item.product}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-xl bg-muted">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* Product name */}
            <p className="text-center text-sm font-medium leading-snug">
              {item.product}
            </p>
          </div>

          <Separator />

          {/* Detail rows */}
          <div className="space-y-2.5 text-sm">
            <DetailRow
              label="Valor unitário"
              value={formatCurrency(unitValue)}
            />

            {isEditable ? (
              <EditableFieldRow
                label="Desconto"
                currentValue={discountValue}
                movementId={item.movementId}
                field="VL_DESCONTO"
              />
            ) : (
              <DetailRow
                label="Desconto"
                value={
                  discountValue > 0
                    ? `- ${formatCurrency(discountValue)}`
                    : formatCurrency(0)
                }
                muted={discountValue === 0}
              />
            )}

            {isEditable ? (
              <EditableFieldRow
                label="Acréscimo"
                currentValue={surchargeValue}
                movementId={item.movementId}
                field="VL_ACRESCIMO"
              />
            ) : (
              <DetailRow
                label="Acréscimo"
                value={
                  surchargeValue > 0
                    ? `+ ${formatCurrency(surchargeValue)}`
                    : formatCurrency(0)
                }
                muted={surchargeValue === 0}
              />
            )}

            <DetailRow label="Quantidade" value={String(item.quantity)} />
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totalValue)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : ""}>{value}</span>
    </div>
  );
}

function EditableFieldRow({
  label,
  currentValue,
  movementId,
  field,
}: {
  label: string;
  currentValue: number;
  movementId: number;
  field: "VL_DESCONTO" | "VL_ACRESCIMO";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleEdit() {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleCancel() {
    setIsEditing(false);
    if (inputRef.current) {
      inputRef.current.value = String(currentValue);
    }
  }

  function handleConfirm() {
    const rawValue = inputRef.current?.value ?? "0";
    const numericValue = Number.parseFloat(rawValue.replace(",", "."));

    if (Number.isNaN(numericValue) || numericValue < 0) {
      toast.error("Informe um valor numérico válido (zero ou maior)");
      return;
    }

    if (numericValue === currentValue) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const result = await updateItemFieldAction(
        movementId,
        field,
        numericValue,
      );

      if (result.success) {
        toast.success(result.message);
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }

  const prefix = field === "VL_DESCONTO" ? "- " : "+ ";
  const displayValue =
    currentValue > 0
      ? `${prefix}${formatCurrency(currentValue)}`
      : formatCurrency(0);

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="shrink-0 text-muted-foreground">{label}</span>

      {isEditing ? (
        <div className="flex items-center gap-1.5">
          <Input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            defaultValue={String(currentValue)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            className="h-7 w-24 px-2 text-right text-sm"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleConfirm}
            disabled={isPending}
            className="text-emerald-600 hover:bg-emerald-600/10 hover:text-emerald-700"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCancel}
            disabled={isPending}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className={currentValue === 0 ? "text-muted-foreground" : ""}>
            {displayValue}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleEdit}
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
