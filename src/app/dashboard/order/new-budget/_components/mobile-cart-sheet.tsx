"use client";

import { ArrowRight, ChevronUp, ShoppingCart, X } from "lucide-react";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();

  const params = new URLSearchParams();
  if (orderId) {
    params.set("step", String(nextStep));
    params.set("orderId", String(orderId));
    if (customerId) params.set("customerId", String(customerId));
  }
  const href = `/dashboard/order/new-budget?${params.toString()}`;
  const itemLabel = itemCount === 1 ? "item" : "itens";

  return (
    <>
      {/* Bottom Bar - mobile only */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md xl:hidden">
        <div className="px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-[22px] border border-border/60 bg-card/90 px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/30 hover:bg-card active:scale-[0.99]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      Carrinho do orçamento
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {itemCount > 0
                        ? `${itemCount} ${itemLabel} no pedido atual`
                        : "Abra o carrinho para acompanhar os produtos adicionados"}
                    </p>
                  </div>
                </div>

                <ChevronUp
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    !isMobile && "rotate-90",
                    open && isMobile && "rotate-180",
                  )}
                />
              </button>
            </SheetTrigger>

            <SheetContent
              side={isMobile ? "bottom" : "right"}
              className={cn(
                "flex flex-col gap-0 p-0 [&>button]:hidden",
                isMobile
                  ? "inset-x-0 bottom-0 h-[min(88dvh,820px)] w-full rounded-t-[30px] border-x border-t border-border/60 bg-background shadow-2xl"
                  : "w-[92%] max-w-lg border-l border-border/60",
              )}
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
                      Revise os itens adicionados antes de seguir para a forma
                      de pagamento.
                    </SheetDescription>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full"
                    onClick={() => setOpen(false)}
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

              {orderId && (
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
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the bottom bar */}
      <div className="h-16 xl:hidden" />
    </>
  );
}
