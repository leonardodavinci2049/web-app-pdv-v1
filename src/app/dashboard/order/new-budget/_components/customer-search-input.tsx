"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";

import { BUDGET_FLOW_STEPS } from "../budget-flow";

interface CustomerSearchInputProps {
  defaultValue: string;
}

export function CustomerSearchInput({
  defaultValue,
}: CustomerSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const trimmed = value.trim();

        if (trimmed.length > 0 && trimmed.length < 3) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set("step", String(BUDGET_FLOW_STEPS.customer));

        if (trimmed) {
          params.set("search", trimmed);
        } else {
          params.delete("search");
        }

        startTransition(() => {
          router.push(`/dashboard/order/new-budget?${params.toString()}`);
        });
      }, 400);
    },
    [searchParams, router],
  );

  const handleClear = useCallback(() => {
    setValue("");
    handleSearch("");
    inputRef.current?.focus();
  }, [handleSearch]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          ref={inputRef}
          id="customer-search"
          // placeholder="Buscar por nome, CPF, CNPJ, e-mail..."
          value={value}
          onChange={(e) => {
            const nextValue = e.target.value;
            setValue(nextValue);
            handleSearch(nextValue);
          }}
          className={isPending ? "pr-10 pl-10 opacity-60" : "pr-10 pl-10"}
        />
        {value ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
