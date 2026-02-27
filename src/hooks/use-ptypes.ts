"use client";

import { useCallback, useEffect, useState } from "react";
import { loadPtypesListAction } from "@/app/actions/action-ptypes";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";

export interface PtypeOption {
  id: number;
  name: string;
}

export function usePtypes() {
  const [ptypes, setPtypes] = useState<PtypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPtypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loadPtypesListAction();

      if (response.success) {
        const options = response.data
          .filter((p: UIPtype) => p.name)
          .map((p: UIPtype) => ({ id: p.id, name: p.name }))
          .sort((a: PtypeOption, b: PtypeOption) =>
            a.name.localeCompare(b.name),
          );
        setPtypes(options);
      } else {
        throw new Error(
          response.message || "Erro ao carregar tipos de produto",
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar tipos de produto";
      setError(errorMessage);
      console.error("Error loading product types:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPtypes();
  }, [loadPtypes]);

  return {
    ptypes,
    isLoading,
    error,
    refetch: loadPtypes,
  };
}
