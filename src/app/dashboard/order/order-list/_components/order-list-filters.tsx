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
import { CustomerSearch } from "./customer-search";

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

function getSelectValue(value: string): string {
  return value === "0" ? SELECT_ALL_VALUE : value;
}

function QuickFilters({
  filters,
  orderStatusOptions,
  onFilterChange,
}: Pick<
  OrderListFiltersProps,
  "filters" | "orderStatusOptions" | "onFilterChange"
>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="orderId">ID do pedido</Label>
        <Input
          id="orderId"
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Buscar por ID..."
          value={filters.orderId}
          onChange={(event) => onFilterChange("orderId", event.target.value)}
        />
      </div>

      <CustomerSearch
        value={filters.customerId}
        onChange={(value) => onFilterChange("customerId", value)}
      />

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
    </div>
  );
}

function AdvancedFilters({
  filters,
  financialStatusOptions,
  onFilterChange,
}: Pick<
  OrderListFiltersProps,
  "filters" | "financialStatusOptions" | "onFilterChange"
>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="finalDate">Data final</Label>
        <Input
          id="finalDate"
          type="date"
          value={filters.finalDate}
          onChange={(event) => onFilterChange("finalDate", event.target.value)}
        />
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleApply = () => {
    onApplyFilters();
    setIsFiltersOpen(false);
  };

  const handleClear = () => {
    onClearFilters();
    setIsFiltersOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">Filtros</h2>
          </div>

          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <div className="whitespace-nowrap rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-sm font-medium">
              {activeFiltersCount} ativo{activeFiltersCount === 1 ? "" : "s"}
            </div>

            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline">
                  <Filter className="size-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[80vw] max-w-[80vw] sm:max-w-md"
              >
                <SheetHeader>
                  <SheetTitle>Filtros da listagem</SheetTitle>
                  <SheetDescription>
                    Ajuste os filtros e aplique para recarregar os pedidos.
                  </SheetDescription>
                </SheetHeader>

                <form
                  className="flex h-full flex-col"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleApply();
                  }}
                >
                  <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
                    <QuickFilters
                      filters={filters}
                      orderStatusOptions={orderStatusOptions}
                      onFilterChange={onFilterChange}
                    />
                    <AdvancedFilters
                      filters={filters}
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
                      Limpar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Filtrando..." : "Filtrar"}
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
