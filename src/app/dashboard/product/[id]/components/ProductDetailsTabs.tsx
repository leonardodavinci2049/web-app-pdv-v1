"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductDetail } from "@/services/api/product/types/product-types";
import { ProductCharacteristicsCard } from "./ProductCharacteristicsCard";
import { ProductGeneralDataCard } from "./ProductGeneralDataCard";
import { ProductDescriptionEditor } from "./tab-card-components/ProductDescriptionEditor";
import ProductImagesList from "./tab-card-components/ProductImagesList";
import { ProductMetadataCard } from "./tab-card-components/ProductMetadataCard";
import { ProductTaxValuesCard } from "./tab-card-components/ProductTaxValuesCard";
import { ProductTechnicalDataCard } from "./tab-card-components/ProductTechnicalDataCard";

interface ProductDetailsTabsProps {
  product: ProductDetail;
  productId: number;
}

export function ProductDetailsTabs({
  product,
  productId,
}: ProductDetailsTabsProps) {
  const router = useRouter();

  // Refresh data after successful updates
  const handleDataChange = () => {
    router.refresh();
  };

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger
          value="description"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Descrição
        </TabsTrigger>
        <TabsTrigger
          value="images"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Imagens
        </TabsTrigger>

        <TabsTrigger
          value="specifications"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Especificações
        </TabsTrigger>
        <TabsTrigger
          value="technical"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Dados Técnicos
        </TabsTrigger>
        <TabsTrigger
          value="metadata"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Metadados
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-4">
        <ProductDescriptionEditor
          productId={productId}
          initialDescription={product.ANOTACOES || ""}
        />
      </TabsContent>

      <TabsContent value="images" className="space-y-4">
        <ProductImagesList product={product} productId={productId} />
      </TabsContent>

      <TabsContent value="specifications" className="space-y-4">
        {/* Card 1 - Dados Gerais */}
        <ProductGeneralDataCard
          productId={productId}
          productName={product.PRODUTO}
          descriptionTab={product.DESCRICAO_TAB || ""}
          label={product.ETIQUETA || ""}
          reference={product.REF || ""}
          model={product.MODELO || ""}
        />

        {/* Card 2 - Características */}
        <ProductCharacteristicsCard
          productId={productId}
          warrantyDays={product.TEMPODEGARANTIA_DIA}
          weightGr={product.PESO_GR}
          lengthMm={product.COMPRIMENTO_MM}
          widthMm={product.LARGURA_MM}
          heightMm={product.ALTURA_MM}
          diameterMm={product.DIAMETRO_MM}
        />

        {/* Card 3 - Taxas */}
        <ProductTaxValuesCard
          productId={productId}
          cfop={product.CFOP}
          cst={product.CST}
          ean={product.EAN}
          ncm={product.NCM}
          nbm={product.NBM}
          ppb={product.PPB}
          temp={product.TEMP}
        />
      </TabsContent>

      <TabsContent value="technical" className="space-y-4">
        <ProductTechnicalDataCard
          product={product}
          productId={productId}
          onDataChange={handleDataChange}
        />
      </TabsContent>

      <TabsContent value="metadata" className="space-y-4">
        <ProductMetadataCard
          metaTitle={product.META_TITLE}
          metaDescription={product.META_DESCRIPTION}
          createdAt={product.DATADOCADASTRO}
          updatedAt={product.DATADOCADASTRO}
          slug={product.SLUG}
        />
      </TabsContent>
    </Tabs>
  );
}
