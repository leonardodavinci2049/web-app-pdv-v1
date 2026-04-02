import type {
  UIProductPdv,
  UIProductPdvRelatedCategory,
} from "@/services/api-main/product-pdv/transformers/transformers";
import { ProductViewCategories } from "./ProductViewCategories";
import { ProductViewGallery } from "./ProductViewGallery";
import { ProductViewHeader } from "./ProductViewHeader";
import { ProductViewPricing } from "./ProductViewPricing";
import { ProductViewStock } from "./ProductViewStock";
import { ProductViewTabs } from "./ProductViewTabs";

interface ProductViewLayoutProps {
  product: UIProductPdv;
  productId: number;
  relatedCategories: UIProductPdvRelatedCategory[];
}

export function ProductViewLayout({
  product,
  productId,
  relatedCategories,
}: ProductViewLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-350 flex-col gap-8">
      <ProductViewHeader product={product} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ProductViewGallery
            productId={productId}
            fallbackImage={product.imagePath || ""}
          />
        </div>
        <div className="flex flex-col gap-6">
          <ProductViewPricing product={product} />
          <ProductViewStock product={product} />
          <ProductViewCategories categories={relatedCategories} />
        </div>
      </div>
      <div>
        <ProductViewTabs product={product} />
      </div>
    </div>
  );
}

export function ProductViewLayoutSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-350 flex-col gap-8 animate-pulse">
      <div className="h-12 bg-muted rounded w-1/3"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-muted rounded"></div>
        <div className="space-y-6">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
      <div className="h-64 bg-muted rounded"></div>
    </div>
  );
}
