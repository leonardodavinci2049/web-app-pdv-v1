"use client";

import { useCallback, useEffect, useState } from "react";
import { loadBrandsListAction } from "@/app/actions/action-brands";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";

export interface BrandOption {
  id: number;
  name: string;
}

export function useBrands() {
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loadBrandsListAction();

      if (response.success) {
        const options = response.data
          .filter((b: UIBrand) => b.name)
          .map((b: UIBrand) => ({ id: b.id, name: b.name }))
          .sort((a: BrandOption, b: BrandOption) =>
            a.name.localeCompare(b.name),
          );
        setBrands(options);
      } else {
        throw new Error(response.message || "Erro ao carregar marcas");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar marcas";
      setError(errorMessage);
      console.error("Error loading brands:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  return {
    brands,
    isLoading,
    error,
    refetch: loadBrands,
  };
}
