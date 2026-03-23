"use client";

import { ArrowRight, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileCartSheetProps {
  children: React.ReactNode;
  itemCount: number;
  orderId?: number;
  customerId?: number;
  nextStep: number;
  nextLabel: string;
  disabled: boolean;
}

export function MobileCartSheet({
  children,
  itemCount,
  orderId,
  customerId,
  nextStep,
  nextLabel,
  disabled,
}: MobileCartSheetProps) {
  const [open, setOpen] = useState(false);

  const params = new URLSearchParams();
  if (orderId) {
    params.set("step", String(nextStep));
    params.set("orderId", String(orderId));
    if (customerId) params.set("customerId", String(customerId));
  }
  const href = `/dashboard/order/new-budget?${params.toString()}`;

  return (
    <>
      {/* Bottom Bar - mobile only */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md xl:hidden">
        <div className="flex items-center justify-around px-4 py-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="relative flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-muted-foreground transition-colors hover:text-foreground active:text-primary"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  Carrinho
                </span>
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="flex w-[90%] flex-col gap-0 p-0 [&>button]:hidden"
            >
              <SheetHeader className="flex-row items-center justify-between border-b border-border/60 px-4 py-3">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <ShoppingCart className="h-4 w-4" />
                  Carrinho
                  {itemCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {itemCount} {itemCount === 1 ? "item" : "itens"}
                    </Badge>
                  )}
                </SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fechar</span>
                </Button>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-4">{children}</div>

              {orderId && (
                <div className="border-t border-border/60 bg-background/95 p-4">
                  {disabled ? (
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">
                        Adicione pelo menos um item para avançar.
                      </p>
                      <Button disabled className="w-full">
                        {nextLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={href}>
                        {nextLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the bottom bar */}
      <div className="h-16 xl:hidden" />
    </>
  );
}
