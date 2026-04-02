"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { ProductViewDescription } from "./ProductViewDescription";
import { ProductViewSpecs } from "./ProductViewSpecs";
import { ProductViewTechnical } from "./ProductViewTechnical";

interface ProductViewTabsProps {
  product: UIProductPdv;
}

export function ProductViewTabs({ product }: ProductViewTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
        <TabsTrigger value="description">Descrição</TabsTrigger>
        <TabsTrigger value="specifications">Especificações</TabsTrigger>
        <TabsTrigger value="technical">Dados Técnicos</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <ProductViewDescription product={product} />
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <ProductViewSpecs product={product} />
      </TabsContent>

      <TabsContent value="technical" className="mt-6">
        <ProductViewTechnical product={product} />
      </TabsContent>
    </Tabs>
  );
}
