"use client";

import { useEffect, useState } from "react";
import { loadCategoriesMenuAction } from "@/app/actions/action-categories";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";

export interface CategoryOption {
  id: number;
  name: string;
  level: number;
  displayName: string; // Nome formatado com traços
}

/**
 * Hook for loading and managing categories from taxonomy API
 * Loads hierarchical categories and flattens them with proper formatting
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories on component mount
  useEffect(() => {
    /**
     * Flattens hierarchical taxonomy data into a single array with formatted names
     * @param taxonomies - Array of taxonomy data with hierarchical structure
     * @param level - Current level for formatting (1, 2, 3)
     * @returns Flattened array of category options
     */
    const flattenCategories = (
      taxonomies: TaxonomyData[],
      level: number = 1,
    ): CategoryOption[] => {
      const result: CategoryOption[] = [];

      for (const taxonomy of taxonomies) {
        // Format display name based on level
        let displayName = taxonomy.TAXONOMIA;
        if (level === 2) {
          displayName = `- ${taxonomy.TAXONOMIA}`;
        } else if (level === 3) {
          displayName = `-- ${taxonomy.TAXONOMIA}`;
        }

        result.push({
          id: taxonomy.ID_TAXONOMY,
          name: taxonomy.TAXONOMIA,
          level,
          displayName,
        });

        // Recursively add children if they exist
        if (taxonomy.children && taxonomy.children.length > 0) {
          result.push(...flattenCategories(taxonomy.children, level + 1));
        }
      }

      return result;
    };

    /**
     * Loads categories using Server Action
     * Uses pe_id_tipo = 2 for product categories as per API documentation
     */
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Call Server Action to load categories
        const response = await loadCategoriesMenuAction();

        if (response.success) {
          const flattenedCategories = flattenCategories(response.data);
          setCategories(flattenedCategories);
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
        // Inline flattening for refetch
        const flatten = (
          taxonomies: TaxonomyData[],
          level: number = 1,
        ): CategoryOption[] => {
          const result: CategoryOption[] = [];
          for (const taxonomy of taxonomies) {
            let displayName = taxonomy.TAXONOMIA;
            if (level === 2) displayName = `- ${taxonomy.TAXONOMIA}`;
            else if (level === 3) displayName = `-- ${taxonomy.TAXONOMIA}`;

            result.push({
              id: taxonomy.ID_TAXONOMY,
              name: taxonomy.TAXONOMIA,
              level,
              displayName,
            });

            if (taxonomy.children && taxonomy.children.length > 0) {
              result.push(...flatten(taxonomy.children, level + 1));
            }
          }
          return result;
        };

        const flattenedCategories = flatten(response.data);
        setCategories(flattenedCategories);
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
