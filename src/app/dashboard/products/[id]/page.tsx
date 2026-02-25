import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import {
  ProductDetailsLayout,
  ProductDetailsLayoutSkeleton,
} from "@/components/dashboard/product/ProductDetails/ProductDetailsLayout";
import { createLogger } from "@/lib/logger";
import { ProductServiceApi } from "@/services/api/product/product-service-api";
import type {
  ProductDetail,
  ProductRelatedTaxonomy,
} from "@/services/api/product/types/product-types";

const logger = createLogger("ProductDetailsPageV2");

// Schema for validating dynamic route parameters
const ProductPageParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID deve ser um número válido")
    .transform(Number),
});

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

// Server Component - Fetch data directly
async function ProductDetailsPageContent({ productId }: { productId: number }) {
  let product: ProductDetail | null = null;
  let relatedTaxonomies: ProductRelatedTaxonomy[] = [];
  let hasError = false;

  try {
    // Call the API service to get product details
    const response = await ProductServiceApi.findProductById({
      pe_type_business: 1, // Default business type
      pe_id_produto: productId,
      pe_slug_produto: "", // Search by ID, not slug
    });

    // Validate response
    if (!ProductServiceApi.isValidProductDetailResponse(response)) {
      hasError = true;
      logger.error("Invalid product detail response:", response);
    } else {
      product = ProductServiceApi.extractProductDetail(response);
      relatedTaxonomies = ProductServiceApi.extractRelatedTaxonomies(response);

      if (!product) {
        hasError = true;
        logger.error("Product not found in response:", response);
      }
    }
  } catch (error) {
    hasError = true;
    logger.error("Error fetching product details:", error);
  }

  // Show 404 if product not found
  if (hasError || !product) {
    logger.warn(`Product not found or error occurred for ID: ${productId}`);
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 py-6">
          <div className="px-4 lg:px-6">
            {/* New Modern Product Details Layout */}
            <ProductDetailsLayout
              product={product}
              productId={productId}
              relatedTaxonomies={relatedTaxonomies}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  // Await params as it's a Promise in Next.js 15
  const routeParams = await params;

  // Validate and extract product ID from route params
  let productId: number;

  try {
    const validatedParams = ProductPageParamsSchema.parse({
      id: routeParams.id,
    });
    productId = validatedParams.id;
  } catch (error) {
    logger.error("Invalid product ID parameter:", error);
    notFound();
  }

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Produtos", href: "#" },
    { label: "Catálogo", href: "/dashboard/product/catalog" },
    { label: "Detalhes", isActive: true },
  ];

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do Produto"
        breadcrumbItems={breadcrumbItems}
      />

      <Suspense
        fallback={
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-6">
              <div className="flex flex-col gap-6 py-6">
                <div className="px-4 lg:px-6">
                  <ProductDetailsLayoutSkeleton />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <ProductDetailsPageContent productId={productId} />
      </Suspense>
    </>
  );
}
