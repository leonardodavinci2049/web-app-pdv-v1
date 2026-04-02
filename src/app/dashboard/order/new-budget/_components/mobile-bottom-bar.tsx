"use client";

import { ArrowRight, Menu, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";

interface MobileBottomBarProps {
  children?: React.ReactNode;
  itemCount: number;
  orderId?: number;
  customerId?: number;
  nextStep?: number;
  nextLabel?: string;
  disabled?: boolean;
}

export function MobileBottomBar({
  children,
  itemCount,
  orderId,
  customerId,
  nextStep,
  nextLabel,
  disabled,
}: MobileBottomBarProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const { toggleSidebar } = useSidebar();

  const params = new URLSearchParams();
  if (orderId && nextStep) {
    params.set("step", String(nextStep));
    params.set("orderId", String(orderId));
    if (customerId) params.set("customerId", String(customerId));
  }
  const href = `/dashboard/order/new-budget?${params.toString()}`;
  const itemLabel = itemCount === 1 ? "item" : "itens";

  return (
    <>
      {/* Bottom Bar - mobile only */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur-lg xl:hidden">
        <div className="flex items-center justify-around px-6 py-1.5 pb-[calc(0.35rem+env(safe-area-inset-bottom))]">
          {/* Menu button */}
          <button
            type="button"
            onClick={() => toggleSidebar()}
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground active:scale-95"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>

          {/* Cart button */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground active:scale-95"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                >
                  {itemCount}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">Carrinho</span>
          </button>
        </div>
      </div>

      {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="bottom"
          className="inset-x-0 bottom-0 flex h-[min(88dvh,820px)] w-full flex-col gap-0 rounded-t-[30px] border-x border-t border-border/60 bg-background p-0 shadow-2xl [&>button]:hidden"
        >
          <SheetHeader className="gap-3 border-b border-border/60 px-3 py-4 sm:px-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShoppingCart className="h-4 w-4" />
                  Carrinho
                  {itemCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {itemCount} {itemLabel}
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription>
                  Revise os itens adicionados ao orçamento.
                </SheetDescription>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full"
                onClick={() => setCartOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </Button>
            </div>

            {orderId && (
              <div className="inline-flex w-fit rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Pedido #{orderId}
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4">
            {children}
          </div>

          {orderId && nextStep && nextLabel && (
            <div className="border-t border-border/60 bg-background/95 px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-4">
              {disabled ? (
                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Adicione pelo menos um item para avançar.
                  </p>
                  <Button disabled className="h-11 w-full rounded-2xl">
                    {nextLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button asChild className="h-11 w-full rounded-2xl">
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

      {/* Spacer to prevent content from being hidden behind the bottom bar */}
      <div className="h-14 xl:hidden" />
    </>
  );
}
