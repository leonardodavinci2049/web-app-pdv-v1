"use client";

import {
  ArrowUpDown,
  Filter,
  Layers,
  Loader2,
  type LucideIcon,
  RotateCcw,
  Search,
  Shapes,
  Tag,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import type { FilterOptions, SortOption } from "@/types/types";

export interface CategoryOption {
  id: number;
  name: string;
  level: number;
  displayName: string;
}

interface ProductListFiltersProps {
  filters: FilterOptions;
  categories: CategoryOption[];
  brands: UIBrand[];
  ptypes: UIPtype[];
  onFiltersChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  totalProducts: number;
  displayedProducts: number;
  isLoading?: boolean;
}

const sortOptions = [
  { value: "name-asc" as SortOption, label: "Nome A-Z" },
  { value: "name-desc" as SortOption, label: "Nome Z-A" },
  { value: "newest" as SortOption, label: "Mais Recentes" },
  { value: "price-asc" as SortOption, label: "Menor Preço" },
  { value: "price-desc" as SortOption, label: "Maior Preço" },
];

function FilterSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/70 text-foreground shadow-sm">
          <Icon className="size-4" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
      </div>

      {children}
    </section>
  );
}

export function ProductListFilters({
  filters,
  categories,
  brands,
  ptypes,
  onFiltersChange,
  onResetFilters,
  totalProducts,
  displayedProducts,
  isLoading = false,
}: ProductListFiltersProps) {
  const [searchInputValue, setSearchInputValue] = useState(filters.searchTerm);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchInputValue(filters.searchTerm);
  }, [filters.searchTerm]);

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    if (searchInputValue.trim() !== filters.searchTerm) {
      updateFilter("searchTerm", searchInputValue.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchInputValue("");
    if (filters.searchTerm !== "") {
      updateFilter("searchTerm", "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleResetFilters = () => {
    setSearchInputValue("");
    onResetFilters();
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      ...filters,
      selectedCategory: categoryId,
    });
  };

  const handleBrandChange = (brandId: string) => {
    onFiltersChange({
      ...filters,
      selectedBrand: brandId === "all" ? undefined : brandId,
    });
  };

  const handlePtypeChange = (ptypeId: string) => {
    onFiltersChange({
      ...filters,
      selectedPtype: ptypeId === "all" ? undefined : ptypeId,
    });
  };

  const removeFilter = (
    filterType: "category" | "search" | "stock" | "brand" | "ptype",
  ) => {
    switch (filterType) {
      case "category":
        onFiltersChange({
          ...filters,
          selectedCategory: "all",
        });
        break;
      case "search":
        handleClearSearch();
        break;
      case "stock":
        updateFilter("onlyInStock", false);
        break;
      case "brand":
        onFiltersChange({
          ...filters,
          selectedBrand: undefined,
        });
        break;
      case "ptype":
        onFiltersChange({
          ...filters,
          selectedPtype: undefined,
        });
        break;
    }
  };

  const getActiveFilters = () => {
    const activeFilters = [];

    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      activeFilters.push({
        type: "search" as const,
        label: `Busca: "${filters.searchTerm}"`,
        value: filters.searchTerm,
      });
    }

    if (filters.selectedCategory && filters.selectedCategory !== "all") {
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === filters.selectedCategory,
      );
      activeFilters.push({
        type: "category" as const,
        label: `Categoria: ${selectedCategory?.name || filters.selectedCategory}`,
        value: filters.selectedCategory,
      });
    }

    if (filters.selectedBrand) {
      const selectedBrand = brands.find(
        (brand) => brand.id.toString() === filters.selectedBrand,
      );
      activeFilters.push({
        type: "brand" as const,
        label: `Marca: ${selectedBrand?.name || filters.selectedBrand}`,
        value: filters.selectedBrand,
      });
    }

    if (filters.selectedPtype) {
      const selectedPtype = ptypes.find(
        (ptype) => ptype.id.toString() === filters.selectedPtype,
      );
      activeFilters.push({
        type: "ptype" as const,
        label: `Tipo: ${selectedPtype?.name || filters.selectedPtype}`,
        value: filters.selectedPtype,
      });
    }

    if (filters.onlyInStock) {
      activeFilters.push({
        type: "stock" as const,
        label: "Apenas em Estoque",
        value: "stock",
      });
    }

    return activeFilters;
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center w-full">
        <div className="flex items-center w-full max-w-xl lg:max-w-2xl">
          <div className="relative flex-1 group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            </div>
            <Input
              // placeholder="Buscar por nome ou SKU..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-11 rounded-r-none border-r-0 pl-10 pr-9 text-sm shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
              disabled={isLoading}
            />
            {searchInputValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            onClick={handleSearch}
            disabled={
              isLoading || searchInputValue.trim() === filters.searchTerm
            }
            className="h-11 rounded-l-none px-4 sm:px-5 gap-2 shadow-sm shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="hidden sm:inline text-sm">Pesquisar</span>
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 rounded-3xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Filtros</h2>
        </div>

        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <div className="whitespace-nowrap rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-sm font-medium tabular-nums">
            {activeFilters.length} ativo{activeFilters.length === 1 ? "" : "s"}
          </div>

          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-border/70 bg-background/90 px-4 shadow-sm hover:bg-muted/60"
              >
                <Filter className="size-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              aria-describedby={undefined}
              className="flex h-full w-[80vw] max-w-[80vw] flex-col gap-0 border-l border-border/60 bg-background p-0 shadow-2xl sm:max-w-xl"
            >
              <SheetHeader className="gap-4 border-b border-border/60 bg-linear-to-b from-background via-background to-muted/30 px-4 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/70 shadow-sm">
                      <Filter className="size-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <SheetTitle className="text-lg tracking-tight">
                        Filtros de produtos
                      </SheetTitle>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full"
                    onClick={() => setIsFiltersOpen(false)}
                    aria-label="Fechar filtros"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {hasActiveFilters
                      ? `${activeFilters.length} filtro${activeFilters.length === 1 ? "" : "s"} ativo${activeFilters.length === 1 ? "" : "s"}`
                      : "Nenhum filtro aplicado"}
                  </div>
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
                <div className="space-y-5 pb-4">
                  <FilterSection
                    icon={ArrowUpDown}
                    title="Exibição e ordenação"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="stock-filter"
                          className="cursor-pointer text-sm font-medium"
                        >
                          Apenas em estoque
                        </label>
                        <Switch
                          checked={filters.onlyInStock}
                          onCheckedChange={(checked) =>
                            updateFilter("onlyInStock", checked)
                          }
                          id="stock-filter"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium">Ordenar por</span>
                        <Select
                          value={filters.sortBy}
                          onValueChange={(value) =>
                            updateFilter("sortBy", value as SortOption)
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Ordenar" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </FilterSection>

                  <FilterSection icon={Layers} title="Categoria">
                    <Select
                      value={filters.selectedCategory}
                      onValueChange={handleCategoryChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Categorias</SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterSection>

                  <FilterSection icon={Tag} title="Marca">
                    <Select
                      value={filters.selectedBrand || "all"}
                      onValueChange={handleBrandChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="brand" className="w-full">
                        <SelectValue placeholder="Selecione uma marca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Marcas</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem
                            key={brand.id}
                            value={brand.id.toString()}
                          >
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterSection>

                  <FilterSection icon={Shapes} title="Tipo">
                    <Select
                      value={filters.selectedPtype || "all"}
                      onValueChange={handlePtypeChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="ptype" className="w-full">
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        {ptypes.map((ptype) => (
                          <SelectItem
                            key={ptype.id}
                            value={ptype.id.toString()}
                          >
                            {ptype.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterSection>
                </div>
              </div>

              <SheetFooter className="mt-0 shrink-0 border-t border-border/60 bg-background/95 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl px-5"
                    onClick={() => {
                      handleResetFilters();
                      setIsFiltersOpen(false);
                    }}
                    disabled={isLoading}
                  >
                    <RotateCcw className="size-4" />
                    Limpar
                  </Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
