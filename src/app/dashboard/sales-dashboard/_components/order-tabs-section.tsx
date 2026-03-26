"use client";

import type * as React from "react";
import { FileText, ShoppingCart, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderTabsSectionProps {
  cartContent: React.ReactNode;
  purchaseDetailsContent: React.ReactNode;
  customerDetailsContent: React.ReactNode;
}

export function OrderTabsSection({
  cartContent,
  purchaseDetailsContent,
  customerDetailsContent,
}: OrderTabsSectionProps) {
  return (
    <Tabs defaultValue="cart" className="flex flex-col">
      <div className="overflow-hidden rounded-full border border-border/70 bg-card/80 p-1 shadow-lg shadow-black/5 backdrop-blur-sm dark:bg-card/60 dark:shadow-black/20">
        <TabsList
          variant="default"
          className="h-auto w-full gap-1 bg-transparent p-0"
        >
          <TabsTrigger
            value="cart"
            className="flex-1 gap-2 rounded-full px-3 py-2 text-[13px] font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 md:px-4 md:py-2.5 md:text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden whitespace-nowrap xs:inline">Carrinho</span>
          </TabsTrigger>

          <TabsTrigger
            value="purchase-details"
            className="flex-1 gap-2 rounded-full px-3 py-2 text-[13px] font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 md:px-4 md:py-2.5 md:text-sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden whitespace-nowrap xs:inline">
              Detalhes Compras
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="customer-details"
            className="flex-1 gap-2 rounded-full px-3 py-2 text-[13px] font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 md:px-4 md:py-2.5 md:text-sm"
          >
            <UserRound className="h-4 w-4" />
            <span className="hidden whitespace-nowrap xs:inline">
              Detalhe Cliente
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="cart"
        forceMount
        className="mt-4 outline-none data-[state=inactive]:hidden"
      >
        {cartContent}
      </TabsContent>

      <TabsContent
        value="purchase-details"
        forceMount
        className="mt-4 outline-none data-[state=inactive]:hidden"
      >
        {purchaseDetailsContent}
      </TabsContent>

      <TabsContent
        value="customer-details"
        forceMount
        className="mt-4 outline-none data-[state=inactive]:hidden"
      >
        {customerDetailsContent}
      </TabsContent>
    </Tabs>
  );
}
