"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { BUDGET_FLOW_STEPS } from "../budget-flow";

interface ProductSearchInputProps {
  defaultValue: string;
  orderId?: number;
  customerId: number;
  flagStock: number;
}

export function ProductSearchInput({
  defaultValue,
  orderId,
  customerId,
  flagStock,
}: ProductSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const buildParams = useCallback(
    (overrides?: { search?: string; flagStock?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", String(BUDGET_FLOW_STEPS.cart));
      params.set("customerId", String(customerId));

      if (orderId) {
        params.set("orderId", String(orderId));
      } else {
        params.delete("orderId");
      }

      if (overrides?.search !== undefined) {
        if (overrides.search.trim()) {
          params.set("search", overrides.search.trim());
        } else {
          params.delete("search");
        }
      }

      if (overrides?.flagStock !== undefined) {
        if (overrides.flagStock === 0) {
          params.set("flagStock", "0");
        } else {
          params.delete("flagStock");
        }
      }

      return params;
    },
    [searchParams, orderId, customerId],
  );

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const params = buildParams({ search: value });
        startTransition(() => {
          router.push(`/dashboard/order/new-budget?${params.toString()}`);
        });
      }, 400);
    },
    [buildParams, router],
  );

  const handleStockToggle = useCallback(
    (checked: boolean) => {
      const params = buildParams({ flagStock: checked ? 1 : 0 });
      startTransition(() => {
        router.push(`/dashboard/order/new-budget?${params.toString()}`);
      });
    },
    [buildParams, router],
  );

  return (
    <div className="flex items-center gap-4">
      <div className="relative max-w-100 flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="product-search"
          // placeholder="Buscar por nome, referência, modelo, etiqueta..."
          defaultValue={defaultValue}
          onChange={(e) => handleSearch(e.target.value)}
          className={isPending ? "pl-10 opacity-60" : "pl-10"}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Switch
          id="stock-filter"
          size="sm"
          checked={flagStock === 1}
          onCheckedChange={handleStockToggle}
        />
        <Label
          htmlFor="stock-filter"
          className="cursor-pointer text-xs whitespace-nowrap text-muted-foreground"
        >
          Estoque
        </Label>
      </div>
    </div>
  );
}
