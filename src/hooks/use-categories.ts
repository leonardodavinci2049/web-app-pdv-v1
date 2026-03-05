"use client";

import { useEffect, useState } from "react";
import { loadCategoriesMenuAction } from "@/app/actions/action-categories";
import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";

export interface CategoryOption {
  id: number;
  name: string;
  level: number;
  displayName: string; // Nome formatado com traços
}

/**
 * Hook for loading and managing categories from taxonomy API
 * Loads categories and formats them with proper level display
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories on component mount
  useEffect(() => {
    /**
     * Formats menu items into category options with display names
     */
    const formatCategories = (
      items: UITaxonomyMenuItem[],
    ): CategoryOption[] => {
      return items.map((item) => {
        let displayName = item.name;
        if (item.level === 2) {
          displayName = `- ${item.name}`;
        } else if (item.level >= 3) {
          displayName = `-- ${item.name}`;
        }

        return {
          id: item.id,
          name: item.name,
          level: item.level,
          displayName,
        };
      });
    };

    /**
     * Loads categories using Server Action
     */
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loadCategoriesMenuAction();

        if (response.success) {
          const formattedCategories = formatCategories(response.data);
          setCategories(formattedCategories);
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar categorias";
        setError(errorMessage);
        console.error("Error loading categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Separate refetch function for manual reload
  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loadCategoriesMenuAction();

      if (response.success) {
        const formattedCategories = response.data.map(
          (item: UITaxonomyMenuItem) => {
            let displayName = item.name;
            if (item.level === 2) displayName = `- ${item.name}`;
            else if (item.level >= 3) displayName = `-- ${item.name}`;

            return {
              id: item.id,
              name: item.name,
              level: item.level,
              displayName,
            };
          },
        );
        setCategories(formattedCategories);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar categorias";
      setError(errorMessage);
      console.error("Error loading categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
}
