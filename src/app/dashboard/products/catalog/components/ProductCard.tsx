"use client";

import { Eye, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "../../../../../types/types";
import { formatCurrency } from "../../../../../utils/common-utils";
import { CategoryTags } from "./CategoryTags";
import { InlineCategoryEditor } from "./InlineCategoryEditor";
import { InlineNameEditor } from "./InlineNameEditor";
import { InlinePriceEditor } from "./InlinePriceEditor";
import { InlineStockEditor } from "./InlineStockEditor";
import { ProductCardClient } from "./ProductCardClient";

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  onViewDetails?: (productId: string) => void;
  onImageUploadSuccess?: () => void;
}

export function ProductCard({
  product,
  viewMode,
  onViewDetails,
  onImageUploadSuccess,
}: ProductCardProps) {
  const [currentStock, setCurrentStock] = useState(product.stock);
  const [currentRetailPrice, setCurrentRetailPrice] = useState(
    product.normalPrice,
  );
  const [currentWholesalePrice, setCurrentWholesalePrice] = useState(
    product.wholesalePrice,
  );
  const [currentCorporatePrice, setCurrentCorporatePrice] = useState(
    product.corporatePrice,
  );
  const [currentName, setCurrentName] = useState(product.name);
  const [currentCategories, setCurrentCategories] = useState(
    product.categories || [],
  );

  const hasPromotion = Boolean(
    product.promotionalPrice && product.promotionalPrice < product.normalPrice,
  );

  const handleStockUpdated = (newStock: number) => {
    setCurrentStock(newStock);
  };

  const handlePricesUpdated = (
    retailPrice: number,
    wholesalePrice: number,
    corporatePrice: number,
  ) => {
    setCurrentRetailPrice(retailPrice);
    setCurrentWholesalePrice(wholesalePrice);
    setCurrentCorporatePrice(corporatePrice);
  };

  const handleNameUpdated = (newName: string) => {
    setCurrentName(newName);
  };

  const handleCategoriesUpdated = (categories: typeof currentCategories) => {
    setCurrentCategories(categories);
  };

  if (viewMode === "list") {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Imagem */}
            <div className="flex-shrink-0">
              <ProductCardClient
                product={product}
                viewMode={viewMode}
                onImageUploadSuccess={onImageUploadSuccess}
              />
            </div>

            {/* Informações - Layout fluido */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Header: Nome, SKU, Categoria */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-2">
                    <InlineNameEditor
                      productId={Number(product.id) || 0}
                      productName={currentName}
                      onNameUpdated={handleNameUpdated}
                    />
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <p className="text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                      {product.brand && (
                        <p className="text-muted-foreground">
                          Marca: {product.brand}
                        </p>
                      )}
                      {product.type && (
                        <p className="text-muted-foreground">
                          Tipo: {product.type}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preços - Editor Inline */}
              <div className="md:max-w-xs">
                {hasPromotion && (
                  <div className="mb-2">
                    <p className="text-muted-foreground text-xs md:text-sm line-through">
                      Preço original: {formatCurrency(product.normalPrice)}
                    </p>
                  </div>
                )}
                <InlinePriceEditor
                  productId={Number(product.id) || 0}
                  productName={product.name}
                  retailPrice={currentRetailPrice}
                  wholesalePrice={currentWholesalePrice}
                  corporatePrice={currentCorporatePrice}
                  onPricesUpdated={handlePricesUpdated}
                />
              </div>

              {/* Estoque e Garantia - Layout responsivo */}
              <div className="flex flex-wrap gap-4 text-sm">
                <InlineStockEditor
                  productId={Number(product.id) || 0}
                  productName={product.name}
                  currentStock={currentStock}
                  onStockUpdated={handleStockUpdated}
                  className="font-medium"
                />
                {product.warrantyDays > 0 && (
                  <div className="text-muted-foreground flex items-center gap-1 text-xs md:text-sm">
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>{product.warrantyDays} dias</span>
                  </div>
                )}
              </div>

              {/* Categorias */}
              <InlineCategoryEditor
                productId={Number(product.id) || 0}
                productSku={product.sku}
                productName={currentName}
                onCategoriesUpdated={handleCategoriesUpdated}
              />
              <CategoryTags categories={currentCategories} />

              {/* Botão - Em linha no desktop, full width no mobile */}
              <div className="flex">
                <Button
                  size="sm"
                  onClick={() => product.id && onViewDetails?.(product.id)}
                  className="gap-2 w-full md:w-auto"
                >
                  <Eye className="h-4 w-4" />
                  Ver detalhes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className="group mx-auto sm:mx-0 w-full max-w-[360px] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:max-w-[500px]">
      <CardContent className="flex h-full flex-col p-4">
        {/* Imagem */}
        <ProductCardClient
          product={product}
          viewMode={viewMode}
          onImageUploadSuccess={onImageUploadSuccess}
          hasPromotion={hasPromotion}
        />

        {/* Conteúdo flexível */}
        <div className="mt-4 flex flex-1 flex-col gap-3">
          {/* Nome SKU E MARCA */}
          <div className="space-y-2">
            <InlineNameEditor
              productId={Number(product.id) || 0}
              productName={currentName}
              onNameUpdated={handleNameUpdated}
              className="text-sm"
            />
            {/* SKU e MARCA na mesma linha */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <p className="text-muted-foreground">SKU: {product.sku}</p>
              {product.brand && (
                <p className="text-muted-foreground">Marca: {product.brand}</p>
              )}
              {product.type && (
                <p className="text-muted-foreground">Tipo: {product.type}</p>
              )}
            </div>
          </div>

          {/* Preços */}
          <div className="space-y-1">
            {hasPromotion && (
              <span className="text-muted-foreground block text-xs line-through">
                Preço original: {formatCurrency(product.normalPrice)}
              </span>
            )}
            <InlinePriceEditor
              productId={Number(product.id) || 0}
              productName={product.name}
              retailPrice={currentRetailPrice}
              wholesalePrice={currentWholesalePrice}
              corporatePrice={currentCorporatePrice}
              onPricesUpdated={handlePricesUpdated}
            />
          </div>

          {/* Estoque e Garantia */}
          <div className="space-y-1">
            <InlineStockEditor
              productId={Number(product.id) || 0}
              productName={product.name}
              currentStock={currentStock}
              onStockUpdated={handleStockUpdated}
              className="text-sm font-medium"
            />
            {product.warrantyDays > 0 && (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3" />
                <span>{product.warrantyDays} dias de garantia</span>
              </div>
            )}
          </div>

          {/* Categorias */}
          <InlineCategoryEditor
            productId={Number(product.id) || 0}
            productSku={product.sku}
            productName={currentName}
            onCategoriesUpdated={handleCategoriesUpdated}
          />
          <CategoryTags categories={currentCategories} />

          {/* Espaçador flexível para empurrar o botão para baixo */}
          <div className="flex-1"></div>

          {/* Botão de ação - sempre no rodapé */}
          <Button
            size="sm"
            className="mt-auto w-full gap-2"
            onClick={() => product.id && onViewDetails?.(product.id)}
          >
            <Eye className="h-4 w-4" />
            Ver detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
