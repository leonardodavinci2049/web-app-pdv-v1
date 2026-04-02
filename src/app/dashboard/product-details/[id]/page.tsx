import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { z } from "zod";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getProductPdvById } from "@/services/api-main/product-pdv/product-pdv-cached-service";
import {
  ProductViewLayout,
  ProductViewLayoutSkeleton,
} from "./_components/ProductViewLayout";

const logger = createLogger("ProductDetailsReadOnlyPage");

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
  await connection();
  const { apiContext } = await getAuthContext();

  const result = await getProductPdvById(productId, {
    ...apiContext,
    pe_type_business: 1,
  });

  if (!result) {
    logger.warn(`Product not found or error occurred for ID: ${productId}`);
    notFound();
  }

  const { product, relatedCategories } = result;

  return (
    <div className="mx-auto flex flex-1 flex-col w-full max-w-350">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 py-6">
          <div className="px-4 lg:px-6">
            <ProductViewLayout
              product={product}
              productId={productId}
              relatedCategories={relatedCategories}
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
    { label: "Produtos", href: "/dashboard/product/catalog" },
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
          <div className="mx-auto flex flex-1 flex-col w-full max-w-350">
            <div className="@container/main flex flex-1 flex-col gap-6">
              <div className="flex flex-col gap-6 py-6">
                <div className="px-4 lg:px-6">
                  <ProductViewLayoutSkeleton />
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
