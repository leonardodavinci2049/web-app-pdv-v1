"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { fetchProductsWithFilters } from "@/app/actions/action-products";
import { createLogger } from "@/lib/logger";
import type { Category, FilterOptions, Product, ViewMode } from "@/types/types";
import { ProductFiltersImproved } from "./ProductFiltersImproved";
import { ProductGrid } from "./ProductGrid";

const logger = createLogger("ProductCatalogContent");

// Key for sessionStorage
const CATALOG_FILTERS_KEY = "product-catalog-filters";

interface ProductCatalogContentProps {
  initialProducts: Product[];
  initialTotal: number;
  categories: Category[];
  hasError?: boolean;
  errorMessage?: string;
}

export function ProductCatalogContent({
  initialProducts,
  initialTotal,
  categories,
  hasError = false,
  errorMessage,
}: ProductCatalogContentProps) {
  // State management
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<FilterOptions>(() => {
    // Initialize filters from sessionStorage on mount
    if (typeof window === "undefined") {
      return {
        searchTerm: "",
        selectedCategory: "all",
        selectedSubcategory: undefined,
        selectedSubgroup: undefined,
        selectedBrand: undefined,
        selectedPtype: undefined,
        onlyInStock: false,
        sortBy: "newest",
      };
    }

    try {
      const saved = sessionStorage.getItem(CATALOG_FILTERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FilterOptions;
        logger.info("Restored filters from sessionStorage:", parsed);
        return parsed;
      }
    } catch (error) {
      logger.error("Error loading saved filters:", error);
    }

    return {
      searchTerm: "",
      selectedCategory: "all",
      selectedSubcategory: undefined,
      selectedSubgroup: undefined,
      selectedBrand: undefined,
      selectedPtype: undefined,
      onlyInStock: false,
      sortBy: "newest",
    };
  });
  const [loadedQuantity, setLoadedQuantity] = useState(20); // Track total quantity loaded
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false); // Track if we reached the end of the list
  const [isInitialized, setIsInitialized] = useState(false);

  // React 18 useTransition for better UX
  const [isPending, startTransition] = useTransition();

  // Show error toast if initial load failed
  if (hasError && errorMessage) {
    toast.error(errorMessage);
  }

  // Handle filter updates
  const updateFilters = useCallback(
    async (newFilters: FilterOptions) => {
      startTransition(async () => {
        try {
          setFilters(newFilters);
          setLoadedQuantity(20); // Reset loaded quantity
          setReachedEnd(false); // Reset end state

          logger.info("Updating filters:", {
            ...newFilters,
            categoryFilterActive: newFilters.selectedCategory !== "all",
          });

          const result = await fetchProductsWithFilters(
            newFilters.searchTerm,
            newFilters.selectedCategory, // This will be the category ID or "all"
            newFilters.onlyInStock,
            newFilters.sortBy,
            1, // First page
            20, // Products per page
          );

          if (result.success) {
            setProducts(result.products);
            setTotal(result.total);

            // Check if we reached the end on initial load or filter change
            if (result.products.length < 20) {
              setReachedEnd(true);
            } else {
              setReachedEnd(false);
            }
          } else {
            toast.error(result.error || "Erro ao filtrar produtos");
            logger.error("Filter error:", result.error);
          }
        } catch (error) {
          toast.error("Erro inesperado ao filtrar produtos");
          logger.error("Unexpected filter error:", error);
        }
      });
    },
    [], // startTransition is stable, no dependencies needed
  );

  // Restore filters on mount and fetch products if there are saved filters
  useEffect(() => {
    if (isInitialized) return;

    const hasActiveFilters =
      filters.searchTerm !== "" ||
      filters.selectedCategory !== "all" ||
      filters.onlyInStock ||
      filters.sortBy !== "newest";

    if (hasActiveFilters) {
      logger.info("Restoring active filters and fetching products");
      // Apply saved filters
      updateFilters(filters);
    }

    setIsInitialized(true);
  }, [
    isInitialized,
    filters,
    filters.searchTerm,
    filters.selectedCategory,
    filters.onlyInStock,
    filters.sortBy,
    updateFilters,
  ]);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;

    try {
      sessionStorage.setItem(CATALOG_FILTERS_KEY, JSON.stringify(filters));
      logger.info("Saved filters to sessionStorage:", filters);
    } catch (error) {
      logger.error("Error saving filters:", error);
    }
  }, [filters, isInitialized]);

  // Reset filters to default
  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      searchTerm: "",
      selectedCategory: "all",
      selectedSubcategory: undefined,
      selectedSubgroup: undefined,
      selectedBrand: undefined,
      selectedPtype: undefined,
      onlyInStock: false,
      sortBy: "newest", // Default to newest products first
    };

    setLoadedQuantity(20); // Reset loaded quantity
    setReachedEnd(false); // Reset end state
    updateFilters(defaultFilters);
  }; // Load more products (increment quantity)
  const loadMore = async () => {
    if (isLoadingMore || reachedEnd) return;

    try {
      setIsLoadingMore(true);
      const newQuantity = loadedQuantity + 20;

      logger.info(`Loading more products - total quantity: ${newQuantity}`);

      const result = await fetchProductsWithFilters(
        filters.searchTerm,
        filters.selectedCategory,
        filters.onlyInStock,
        filters.sortBy,
        1, // Always use page 1 (will be converted to 0 in API)
        newQuantity, // Increment total quantity
      );

      if (result.success) {
        setProducts(result.products); // Replace all products with new expanded list
        setLoadedQuantity(newQuantity);

        // Check if we reached the end (returned less products than requested)
        if (result.products.length < newQuantity) {
          setReachedEnd(true);
        }
      } else {
        toast.error(result.error || "Erro ao carregar mais produtos");
        logger.error("Load more error:", result.error);
      }
    } catch (error) {
      toast.error("Erro inesperado ao carregar mais produtos");
      logger.error("Unexpected load more error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle product details view
  const handleViewDetails = (productId: string) => {
    logger.info("Navigating to product details:", productId);
    // Navigate to product details page using dynamic route
    window.location.href = `/dashboard/product/${productId}`;
  };

  // Handle image upload success - reload products to show updated images
  const handleImageUploadSuccess = async () => {
    try {
      logger.info("Reloading products after image upload");

      const result = await fetchProductsWithFilters(
        filters.searchTerm,
        filters.selectedCategory,
        filters.onlyInStock,
        filters.sortBy,
        1, // First page
        loadedQuantity, // Keep current loaded quantity
      );

      if (result.success) {
        setProducts(result.products);
        setTotal(result.total);
      } else {
        logger.error(
          "Error reloading products after image upload:",
          result.error,
        );
      }
    } catch (error) {
      logger.error("Unexpected error reloading products:", error);
    }
  };

  // Calculate display values
  const displayedProducts = products.length;
  const hasMore = !reachedEnd; // Show button unless we reached the end
  const isLoading = isPending || isLoadingMore;

  return (
    <>
      {/* Filtros */}
      <ProductFiltersImproved
        filters={filters}
        categories={categories}
        viewMode={viewMode}
        onFiltersChange={updateFilters}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
        totalProducts={total}
        displayedProducts={displayedProducts}
        isLoading={isPending}
      />

      {/* Loading Overlay durante a busca */}
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
          {/* Grid de Produtos com overlay */}
          <div className="opacity-50">
            <ProductGrid
              products={products}
              viewMode={viewMode}
              isLoading={isLoading}
              isInitialLoading={false}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onViewDetails={handleViewDetails}
              onImageUploadSuccess={handleImageUploadSuccess}
            />
          </div>
        </div>
      )}

      {/* Grid de Produtos normal */}
      {!isPending && (
        <ProductGrid
          products={products}
          viewMode={viewMode}
          isLoading={isLoading}
          isInitialLoading={false} // We have initial data from server
          hasMore={hasMore}
          onLoadMore={loadMore}
          onViewDetails={handleViewDetails}
          onImageUploadSuccess={handleImageUploadSuccess}
        />
      )}
    </>
  );
}
