"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Filter,
  type LucideIcon,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { type ReactNode, useState } from "react";
import { type ChevronProps, DayPicker } from "react-day-picker";
import { Button, buttonVariants } from "@/components/ui/button";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type {
  OrderListFiltersValues,
} from "../order-list.types";
import { CustomerSearch } from "./customer-search";

interface OrderListFiltersProps {
  filters: OrderListFiltersValues;
  activeFiltersCount: number;
  isLoading: boolean;
  onFilterChange: (field: keyof OrderListFiltersValues, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const LIMIT_OPTIONS = ["20", "50", "100"];

const ORDER_STATUS_OPTIONS = [
  { value: "14", label: "VENDA" },
  { value: "22", label: "ORCAMENTO" },
  { value: "11", label: "ESTORNO" },
  { value: "33", label: "CRÉDITO RMA" },
  { value: "35", label: "DÉBITO" },
  { value: "34", label: "CRÉDITO" },
  { value: "13", label: "TROCA" },
  { value: "39", label: "DEVOLUÇÃO CLIENTE" },
  { value: "12", label: "PEDIDO" },
  { value: "74", label: "ENTRADA" },
  { value: "21", label: "LIBERAÇÃO" },
  { value: "38", label: "CRÉDITO DEFEITO" },
  { value: "77", label: "RMA ABERTO" },
  { value: "109", label: "NFE - RMA" },
  { value: "31", label: "BALANÇO" },
  { value: "89", label: "GARANTIA" },
];

const MAX_VISIBLE_STATUS = 10;

const FINANCIAL_STATUS_OPTIONS = [
  { value: "17", label: "CONCLUÍDO" },
  { value: "0", label: "INEXISTENTE" },
  { value: "18", label: "EM ABERTO" },
];

const LOCATION_OPTIONS = [
  { value: "1", label: "SETOR VENDAS" },
  { value: "3", label: "SETOR FINANCEIRO" },
  { value: "19", label: "LOJA FÍSICA" },
  { value: "2", label: "SETOR RMA" },
  { value: "41", label: "SITE E-COMMERCE" },
];

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return undefined;

  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return undefined;
  }

  return parsedDate;
}

function FilterSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/70 text-foreground shadow-sm">
          <Icon className="size-4" aria-hidden="true" />
        </div>

        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function CalendarChevron({ className, orientation }: ChevronProps) {
  if (orientation === "left") {
    return <ChevronLeft className={cn("size-4", className)} />;
  }

  return <ChevronRight className={cn("size-4", className)} />;
}

function DatePickerField({
  id,
  label,
  value,
  onChange,
}: {
  id: "initialDate" | "finalDate";
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseIsoDate(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-11 w-full justify-between rounded-xl border-border/70 bg-background px-3 text-left font-normal shadow-xs hover:bg-muted/40",
              !selectedDate && "text-muted-foreground",
            )}
          >
            <span>
              {selectedDate
                ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                : "Selecione a data"}
            </span>
            <CalendarRange className="size-4 text-muted-foreground" />
          </Button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={8}
            className="z-60 w-auto rounded-3xl border border-border/70 bg-background p-3 shadow-2xl outline-none"
          >
            <DayPicker
              mode="single"
              locale={ptBR}
              selected={selectedDate}
              showOutsideDays
              onSelect={(date) => {
                onChange(date ? format(date, "yyyy-MM-dd") : "");
                setOpen(false);
              }}
              className="w-full"
              classNames={{
                root: "w-full",
                months: "flex w-full flex-col",
                month: "w-full space-y-4",
                month_caption: "relative flex items-center justify-center pt-1 pb-1",
                caption_label: "text-sm font-semibold capitalize",
                nav: "absolute inset-x-0 top-0 flex items-center justify-between",
                button_previous: cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-10 rounded-xl p-0 text-muted-foreground hover:text-foreground",
                ),
                button_next: cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-10 rounded-xl p-0 text-muted-foreground hover:text-foreground",
                ),
                weekdays: "mb-1 grid grid-cols-7",
                weekday:
                  "text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
                month_grid: "w-full border-collapse",
                weeks: "space-y-1",
                week: "grid grid-cols-7",
                day: "flex items-center justify-center",
                day_button: cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "size-9 rounded-xl p-0 font-normal",
                ),
                selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                today: "border border-border text-foreground",
                outside: "text-muted-foreground/45",
                disabled: "text-muted-foreground/35 opacity-50",
                hidden: "invisible",
              }}
              components={{
                Chevron: CalendarChevron,
              }}
            />

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Limpar
              </Button>

              <p className="text-xs text-muted-foreground">
                {selectedDate
                  ? format(selectedDate, "PPP", { locale: ptBR })
                  : "Sem data selecionada"}
              </p>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function OrderStatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel =
    ORDER_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? null;

  const normalizedSearch = normalizeForSearch(search);
  const filtered = search
    ? ORDER_STATUS_OPTIONS.filter((o) =>
        normalizeForSearch(o.label).includes(normalizedSearch),
      ).slice(0, MAX_VISIBLE_STATUS)
    : ORDER_STATUS_OPTIONS.slice(0, MAX_VISIBLE_STATUS);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <Button
          id="orderStatusId"
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-between rounded-xl border-border/70 bg-background px-3 text-left font-normal shadow-xs hover:bg-muted/40",
            !selectedLabel && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {selectedLabel ?? "Todos os status"}
          </span>
          <ChevronRight className="size-4 rotate-90 text-muted-foreground" />
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          className="z-60 w-(--radix-popover-trigger-width) min-w-56 rounded-xl border border-border/70 bg-background shadow-2xl outline-none"
        >
          <div className="border-b border-border/60 p-2">
            <Input
              type="text"
              autoComplete="off"
              placeholder="Buscar status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            <button
              type="button"
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/60",
                !selectedLabel && "bg-primary/10 font-medium text-primary",
              )}
              onClick={() => {
                onChange("0");
                setOpen(false);
                setSearch("");
              }}
            >
              Todos os status
            </button>

            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/60",
                  value === option.value &&
                    "bg-primary/10 font-medium text-primary",
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {option.label}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                Nenhum status encontrado
              </p>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function QuickFilters({
  filters,
  onFilterChange,
}: Pick<OrderListFiltersProps, "filters" | "onFilterChange">) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="orderId">ID do pedido</Label>
        <Input
          id="orderId"
          name="orderId"
          type="number"
          min="0"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Buscar por ID…"
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
        <OrderStatusSelect
          value={filters.orderStatusId}
          onChange={(value) => onFilterChange("orderStatusId", value)}
        />
      </div>
    </div>
  );
}

function FinancialStatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel =
    FINANCIAL_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? null;

  const normalizedSearch = normalizeForSearch(search);
  const filtered = search
    ? FINANCIAL_STATUS_OPTIONS.filter((o) =>
        normalizeForSearch(o.label).includes(normalizedSearch),
      )
    : FINANCIAL_STATUS_OPTIONS;

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <Button
          id="financialStatusId"
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-between rounded-xl border-border/70 bg-background px-3 text-left font-normal shadow-xs hover:bg-muted/40",
            !selectedLabel && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {selectedLabel ?? "Todos os status"}
          </span>
          <ChevronRight className="size-4 rotate-90 text-muted-foreground" />
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          className="z-60 w-(--radix-popover-trigger-width) min-w-56 rounded-xl border border-border/70 bg-background shadow-2xl outline-none"
        >
          <div className="border-b border-border/60 p-2">
            <Input
              type="text"
              autoComplete="off"
              placeholder="Buscar status\u2026"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            <button
              type="button"
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/60",
                !selectedLabel && "bg-primary/10 font-medium text-primary",
              )}
              onClick={() => {
                onChange("-1");
                setOpen(false);
                setSearch("");
              }}
            >
              Todos os status
            </button>

            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/60",
                  value === option.value &&
                    "bg-primary/10 font-medium text-primary",
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {option.label}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                Nenhum status encontrado
              </p>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function LocationSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel =
    LOCATION_OPTIONS.find((o) => o.value === value)?.label ?? null;

  const normalizedSearch = normalizeForSearch(search);
  const filtered = search
    ? LOCATION_OPTIONS.filter((o) =>
        normalizeForSearch(o.label).includes(normalizedSearch),
      )
    : LOCATION_OPTIONS;

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <Button
          id="locationId"
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-between rounded-xl border-border/70 bg-background px-3 text-left font-normal shadow-xs hover:bg-muted/40",
            !selectedLabel && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {selectedLabel ?? "Todas as localizações"}
          </span>
          <ChevronRight className="size-4 rotate-90 text-muted-foreground" />
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          className="z-60 w-(--radix-popover-trigger-width) min-w-56 rounded-xl border border-border/70 bg-background shadow-2xl outline-none"
        >
          <div className="border-b border-border/60 p-2">
            <Input
              type="text"
              autoComplete="off"
              placeholder="Buscar localização\u2026"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            <button
              type="button"
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/60",
                !selectedLabel && "bg-primary/10 font-medium text-primary",
              )}
              onClick={() => {
                onChange("0");
                setOpen(false);
                setSearch("");
              }}
            >
              Todas as localizações
            </button>

            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/60",
                  value === option.value &&
                    "bg-primary/10 font-medium text-primary",
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {option.label}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                Nenhuma localização encontrada
              </p>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function OperationalFilters({
  filters,
  onFilterChange,
}: Pick<OrderListFiltersProps, "filters" | "onFilterChange">) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="locationId">Localização</Label>
        <LocationSelect
          value={filters.locationId}
          onChange={(value) => onFilterChange("locationId", value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="financialStatusId">Status financeiro</Label>
        <FinancialStatusSelect
          value={filters.financialStatusId}
          onChange={(value) => onFilterChange("financialStatusId", value)}
        />
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

function DateFilters({
  filters,
  onFilterChange,
}: Pick<OrderListFiltersProps, "filters" | "onFilterChange">) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DatePickerField
        id="initialDate"
        label="Data inicial"
        value={filters.initialDate}
        onChange={(value) => onFilterChange("initialDate", value)}
      />

      <DatePickerField
        id="finalDate"
        label="Data final"
        value={filters.finalDate}
        onChange={(value) => onFilterChange("finalDate", value)}
      />
    </div>
  );
}

export function OrderListFilters({
  filters,
  activeFiltersCount,
  isLoading,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: OrderListFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const hasActiveFilters = activeFiltersCount > 0;

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
        <div className="flex items-start justify-between gap-3 rounded-3xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="min-w-0 space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Filtros</h2>
          </div>

          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <div className="whitespace-nowrap rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-sm font-medium tabular-nums">
              {activeFiltersCount} ativo{activeFiltersCount === 1 ? "" : "s"}
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
                          Filtros da listagem
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
                        ? `${activeFiltersCount} filtro${activeFiltersCount === 1 ? "" : "s"} ativo${activeFiltersCount === 1 ? "" : "s"}`
                        : "Nenhum filtro aplicado"}
                    </div>
                  </div>
                </SheetHeader>

                <form
                  className="flex min-h-0 flex-1 flex-col"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleApply();
                  }}
                >
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
                    <div className="space-y-5 pb-4">
                      <FilterSection
                        icon={Search}
                        title="Busca rápida"
                        description=""
                      >
                        <QuickFilters
                          filters={filters}
                          onFilterChange={onFilterChange}
                        />
                      </FilterSection>

                      <FilterSection
                        icon={SlidersHorizontal}
                        title="Critérios operacionais"
                        description=""
                      >
                        <OperationalFilters
                          filters={filters}
                          onFilterChange={onFilterChange}
                        />
                      </FilterSection>

                      <FilterSection
                        icon={CalendarRange}
                        title="Período"
                        description=""
                      >
                        <DateFilters
                          filters={filters}
                          onFilterChange={onFilterChange}
                        />
                      </FilterSection>
                    </div>
                  </div>

                  <SheetFooter className="mt-0 shrink-0 border-t border-border/60 bg-background/95 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-items-center">
                      <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 rounded-xl px-5"
                          onClick={handleClear}
                          disabled={isLoading}
                        >
                          <RotateCcw className="size-4" />
                          Limpar
                        </Button>
                        <Button
                          type="submit"
                          className="h-11 rounded-xl px-5"
                          disabled={isLoading}
                        >
                          {isLoading ? "Filtrando…" : "Filtrar"}
                        </Button>
                      </div>
                    </div>
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
