import { Suspense } from "react";
import { fetchProducts } from "@/app/actions/action-products";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { ProductCatalogContent } from "@/components/dashboard/product/catalog/ProductCatalogContent";

import { createLogger } from "@/lib/logger";
import type { Product } from "@/types/types";
import { ProductGridSkeleton } from "./components/ProductSkeleton";

const logger = createLogger("CatalogPage");

// Server Component - Fetch data directly
export default async function CatalogoPage() {
  let initialProducts: {
    success: boolean;
    products: Product[];
    total: number;
    error?: string;
  };
  let hasError = false;
  let errorMessage = "";

  try {
    // Fetch initial products data with newest first sorting
    const result = await fetchProducts({
      page: 1,
      perPage: 20,
      sortBy: "newest", // Show newest products first
    });

    initialProducts = result;

    if (!result.success) {
      hasError = true;
      errorMessage = result.error || "Erro ao carregar produtos";
      logger.error("Failed to fetch initial products:", result.error);
    }
  } catch (error) {
    hasError = true;
    errorMessage = "Erro inesperado ao carregar produtos";
    logger.error("Unexpected error fetching products:", error);

    // Fallback to empty result
    initialProducts = {
      success: false,
      products: [],
      total: 0,
      error: errorMessage,
    };
  }

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Catálogo"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produtos", href: "#" },
          { label: "Catálogo", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-6">
                {/* Cabeçalho */}
                <div>
                  <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
                  <p className="text-muted-foreground mt-2">
                    Gerencie e visualize todos os produtos do seu catálogo com
                    filtros avançados.
                  </p>
                </div>

                {/* Content with Suspense for better UX */}
                <Suspense
                  fallback={<ProductGridSkeleton viewMode="list" count={8} />}
                >
                  <ProductCatalogContent
                    initialProducts={initialProducts.products}
                    initialTotal={initialProducts.total}
                    categories={[]}
                    hasError={hasError}
                    errorMessage={errorMessage}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
