"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";
import { createTaxonomyRelationship } from "@/app/actions/action-taxonomy";

interface AddCategoryInlineDialogProps {
  productId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Flattens hierarchical taxonomy structure into a flat list
 * preserving the hierarchy information (level)
 * @param categories - Hierarchical taxonomy array
 * @returns Flat array with all taxonomies
 */
function flattenTaxonomyHierarchy(categories: TaxonomyData[]): TaxonomyData[] {
  const result: TaxonomyData[] = [];

  function flatten(items: TaxonomyData[]) {
    for (const item of items) {
      // Add the current item (without children for clean structure)
      const { children, ...itemWithoutChildren } = item;
      result.push(itemWithoutChildren as TaxonomyData);

      // Recursively flatten children
      if (children && children.length > 0) {
        flatten(children);
      }
    }
  }

  flatten(categories);
  return result;
}

/**
 * Get prefix dashes based on level
 * Level 1: no dashes
 * Level 2: one dash (-)
 * Level 3: two dashes (--)
 * @param level - Hierarchy level
 * @returns Prefix string with dashes
 */
function getLevelPrefix(level: number): string {
  if (level === 1) return "";
  if (level === 2) return "- ";
  if (level === 3) return "-- ";
  return "--- "; // Fallback for deeper levels
}

/**
 * AddCategoryInlineDialog Component
 *
 * Dialog to add a category relationship to a product from the inline editor.
 * Allows searching and selecting from available categories.
 */
export function AddCategoryInlineDialog({
  productId,
  open,
  onOpenChange,
  onSuccess,
}: AddCategoryInlineDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [categories, setCategories] = useState<TaxonomyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load categories when dialog opens
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/taxonomy/menu", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar categorias");
      }

      const data = await response.json();

      // Flatten the hierarchical structure into a flat list
      const hierarchicalCategories = data.categories || [];
      const flatCategories = flattenTaxonomyHierarchy(hierarchicalCategories);

      setCategories(flatCategories);
    } catch (_error) {
      toast.error("Erro ao carregar categorias");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open, loadCategories]);

  // Handle dialog close - reset state
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchTerm("");
    }
    onOpenChange(newOpen);
  };

  async function handleAddCategory(categoryId: number) {
    setIsAdding(true);

    try {
      const result = await createTaxonomyRelationship(categoryId, productId);

      if (result.success) {
        toast.success(result.message);
        handleOpenChange(false);
        onSuccess?.();
      } else {
        // Check if it's a duplicate category message (not an error, just information)
        if (result.message.includes("já existe")) {
          toast.info(result.message);
        } else {
          toast.error(result.message);
        }
      }
    } catch (_error) {
      toast.error("Erro inesperado ao adicionar categoria");
    } finally {
      setIsAdding(false);
    }
  }

  // Filter categories based on search
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.TAXONOMIA.toLowerCase().includes(
      searchTerm.toLowerCase(),
    );
    return matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Categoria ao Produto</DialogTitle>
          <DialogDescription>
            Selecione uma categoria para adicionar ao produto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Categories List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria encontrada
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[350px] sm:h-[400px] rounded-md border flex-1">
              <div className="space-y-1 p-4">
                {filteredCategories.map((category) => (
                  <button
                    key={category.ID_TAXONOMY}
                    type="button"
                    onClick={() => handleAddCategory(category.ID_TAXONOMY)}
                    disabled={isAdding}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        {getLevelPrefix(category.LEVEL || 1)}
                      </span>
                      <span>{category.TAXONOMIA}</span>
                    </span>
                    <span className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>ID: {category.ID_TAXONOMY}</span>
                      <span>Nível {category.LEVEL}</span>
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isAdding}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
