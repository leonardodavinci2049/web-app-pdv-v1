"use client";

import { Filter, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  OrderListFiltersValues,
  OrderListStatusOption,
} from "../order-list.types";

interface OrderListFiltersProps {
  filters: OrderListFiltersValues;
  orderStatusOptions: OrderListStatusOption[];
  financialStatusOptions: OrderListStatusOption[];
  activeFiltersCount: number;
  isLoading: boolean;
  onFilterChange: (field: keyof OrderListFiltersValues, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const SELECT_ALL_VALUE = "__all__";

const LIMIT_OPTIONS = ["20", "50", "100"];

const brazilianDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function getSelectValue(value: string): string {
  return value === "0" ? SELECT_ALL_VALUE : value;
}

function formatDateForDisplay(value: string): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return brazilianDateFormatter.format(parsed);
}

function FilterFields({
  filters,
  orderStatusOptions,
  financialStatusOptions,
  onFilterChange,
}: Pick<
  OrderListFiltersProps,
  "filters" | "orderStatusOptions" | "financialStatusOptions" | "onFilterChange"
>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="sellerId">Vendedor</Label>
        <Input
          id="sellerId"
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="ID do vendedor"
          value={filters.sellerId}
          onChange={(event) => onFilterChange("sellerId", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="orderStatusId">Status do pedido</Label>
        <Select
          value={getSelectValue(filters.orderStatusId)}
          onValueChange={(value) =>
            onFilterChange(
              "orderStatusId",
              value === SELECT_ALL_VALUE ? "0" : value,
            )
          }
        >
          <SelectTrigger id="orderStatusId" className="w-full">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SELECT_ALL_VALUE}>Todos os status</SelectItem>
            {orderStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="financialStatusId">Status financeiro</Label>
        <Select
          value={getSelectValue(filters.financialStatusId)}
          onValueChange={(value) =>
            onFilterChange(
              "financialStatusId",
              value === SELECT_ALL_VALUE ? "0" : value,
            )
          }
        >
          <SelectTrigger id="financialStatusId" className="w-full">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SELECT_ALL_VALUE}>Todos os status</SelectItem>
            {financialStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationId">Localização</Label>
        <Input
          id="locationId"
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="ID da localização"
          value={filters.locationId}
          onChange={(event) => onFilterChange("locationId", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialDate">Data inicial</Label>
        <Input
          id="initialDate"
          type="date"
          value={filters.initialDate}
          onChange={(event) =>
            onFilterChange("initialDate", event.target.value)
          }
        />
        {filters.initialDate && (
          <p className="text-muted-foreground text-xs">
            Data selecionada: {formatDateForDisplay(filters.initialDate)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="finalDate">Data final</Label>
        <Input
          id="finalDate"
          type="date"
          value={filters.finalDate}
          onChange={(event) => onFilterChange("finalDate", event.target.value)}
        />
        {filters.finalDate && (
          <p className="text-muted-foreground text-xs">
            Data selecionada: {formatDateForDisplay(filters.finalDate)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="limit">Limite de registros</Label>
        <Select
          value={filters.limit}
          onValueChange={(value) => onFilterChange("limit", value)}
        >
          <SelectTrigger id="limit" className="w-full">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option} registros
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function OrderListFilters({
  filters,
  orderStatusOptions,
  financialStatusOptions,
  activeFiltersCount,
  isLoading,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: OrderListFiltersProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleApply = () => {
    onApplyFilters();
    setIsMobileFiltersOpen(false);
  };

  const handleClear = () => {
    onClearFilters();
    setIsMobileFiltersOpen(false);
  };

  return (
    <div className="space-y-4 rounded-[28px] border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Filtros</h2>
          <p className="text-muted-foreground text-sm">
            Refine a listagem por vendedor, status e período.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-sm font-medium">
            {activeFiltersCount} ativo{activeFiltersCount === 1 ? "" : "s"}
          </div>

          <Sheet
            open={isMobileFiltersOpen}
            onOpenChange={setIsMobileFiltersOpen}
          >
            <SheetTrigger asChild>
              <Button type="button" variant="outline" className="md:hidden">
                <Filter className="size-4" />
                Abrir filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-md">
              <SheetHeader>
                <SheetTitle>Filtros da listagem</SheetTitle>
                <SheetDescription>
                  Ajuste os filtros e aplique para recarregar os pedidos.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <FilterFields
                  filters={filters}
                  orderStatusOptions={orderStatusOptions}
                  financialStatusOptions={financialStatusOptions}
                  onFilterChange={onFilterChange}
                />
              </div>

              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  <RotateCcw className="size-4" />
                  Limpar filtros
                </Button>
                <Button
                  type="button"
                  onClick={handleApply}
                  disabled={isLoading}
                >
                  {isLoading ? "Filtrando..." : "Filtrar"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <form
        className="hidden gap-4 md:flex md:flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          handleApply();
        }}
      >
        <FilterFields
          filters={filters}
          orderStatusOptions={orderStatusOptions}
          financialStatusOptions={financialStatusOptions}
          onFilterChange={onFilterChange}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
          >
            <RotateCcw className="size-4" />
            Limpar filtros
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Filtrando..." : "Filtrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
