"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import type { FilterOptions } from "@/types/types";
import { ProductListEmptyState } from "./product-list-empty-state";
import type { CategoryOption } from "./product-list-filters";
import { ProductListFilters } from "./product-list-filters";
import { ProductListTable } from "./product-list-table";

interface ProductListContentProps {
  products: UIProductPdv[];
  brands: UIBrand[];
  categories: CategoryOption[];
  ptypes: UIPtype[];
}

export function ProductListContent({
  products,
  brands,
  categories,
  ptypes,
}: ProductListContentProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentLimit = Number(searchParams.get("limit")) || 20;

  const filters: FilterOptions = {
    searchTerm: searchParams.get("search") || "",
    selectedCategory: searchParams.get("category") || "all",
    selectedSubcategory: undefined,
    selectedSubgroup: undefined,
    selectedBrand: searchParams.get("brand") || undefined,
    selectedPtype: searchParams.get("type") || undefined,
    onlyInStock: searchParams.get("stock") === "1",
    sortBy: (searchParams.get("sort") as FilterOptions["sortBy"]) || "newest",
  };

  const updateUrl = useCallback(
    (params: URLSearchParams) => {
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router],
  );

  const updateFilters = useCallback(
    (newFilters: FilterOptions) => {
      const params = new URLSearchParams();

      if (newFilters.searchTerm) params.set("search", newFilters.searchTerm);
      if (newFilters.selectedCategory && newFilters.selectedCategory !== "all")
        params.set("category", newFilters.selectedCategory);
      if (newFilters.selectedBrand)
        params.set("brand", newFilters.selectedBrand);
      if (newFilters.selectedPtype)
        params.set("type", newFilters.selectedPtype);
      if (newFilters.onlyInStock) params.set("stock", "1");
      if (newFilters.sortBy && newFilters.sortBy !== "newest")
        params.set("sort", newFilters.sortBy);

      updateUrl(params);
    },
    [updateUrl],
  );

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname);
    });
  }, [pathname, router]);

  const loadMore = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(currentLimit + 20));
    updateUrl(params);
  }, [searchParams, currentLimit, updateUrl]);

  const hasMore = products.length >= currentLimit;
  const isLoading = isPending;

  return (
    <>
      <ProductListFilters
        filters={filters}
        categories={categories}
        brands={brands}
        ptypes={ptypes}
        onFiltersChange={updateFilters}
        onResetFilters={resetFilters}
        totalProducts={products.length}
        displayedProducts={products.length}
        isLoading={isLoading}
      />

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-sm sm:rounded-[28px]">
        {isPending && (
          <div className="relative">
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-lg font-medium">
                    Pesquisando produtos...
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Aguarde enquanto carregamos os resultados
                </p>
              </div>
            </div>
            <div className="opacity-50">
              <div className="overflow-x-auto">
                <ProductListTable products={products} />
              </div>
            </div>
          </div>
        )}

        {!isPending && products.length > 0 && (
          <div className="overflow-x-auto">
            <ProductListTable products={products} />
            {hasMore && (
              <div className="border-t p-4">
                <button
                  type="button"
                  onClick={loadMore}
                  className="mx-auto flex items-center gap-2 rounded-full border-2 border-primary bg-primary/10 px-6 py-2 text-sm font-medium text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <span>Carregar mais</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {!isPending && products.length === 0 && (
          <div className="p-6">
            <ProductListEmptyState
              hasSearch={
                filters.searchTerm.length > 0 ||
                filters.selectedCategory !== "all" ||
                !!filters.selectedBrand ||
                !!filters.selectedPtype ||
                filters.onlyInStock
              }
            />
          </div>
        )}
      </div>
    </>
  );
}
