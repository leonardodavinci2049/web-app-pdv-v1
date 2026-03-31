"use client";

import {
  ChevronDown,
  Filter,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { cn } from "@/lib/utils";
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Filtros</h2>
            <p className="text-muted-foreground text-sm">
              Localize pedidos rapidamente por ID, cliente ou status
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
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-md">
                <SheetHeader>
                  <SheetTitle>Filtros da listagem</SheetTitle>
                  <SheetDescription>
                    Ajuste os filtros e aplique para recarregar os pedidos.
                  </SheetDescription>
                </SheetHeader>

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

        <QuickFilters
          filters={filters}
          orderStatusOptions={orderStatusOptions}
          onFilterChange={onFilterChange}
        />

        <Collapsible
          open={isAdvancedOpen}
          onOpenChange={setIsAdvancedOpen}
          className="hidden md:block"
        >
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <SlidersHorizontal className="size-4 mr-2" />
                Filtros avançados
                <ChevronDown
                  className={cn(
                    "size-4 ml-2 transition-transform",
                    isAdvancedOpen && "rotate-180",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-4">
            <AdvancedFilters
              filters={filters}
              financialStatusOptions={financialStatusOptions}
              onFilterChange={onFilterChange}
            />
          </CollapsibleContent>
        </Collapsible>

        <form
          className="hidden md:flex md:flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            handleApply();
          }}
        >
          <div className="flex items-center justify-end gap-2">
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
          </div>
        </form>
      </div>
    </div>
  );
}
