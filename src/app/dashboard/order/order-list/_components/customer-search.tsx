"use client";

import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  searchCustomersAction,
  type CustomerSearchResult,
} from "../actions/search-customers-action";

interface CustomerSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CustomerSearch({
  value,
  onChange,
  disabled = false,
}: CustomerSearchProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!value) {
      setSelectedName("");
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (term.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchCustomersAction(term);
        setResults(data);
        setIsOpen(data.length > 0);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const handleSelect = useCallback(
    (customer: CustomerSearchResult) => {
      onChange(String(customer.customerId));
      setSelectedName(customer.name);
      setSearch("");
      setResults([]);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange("");
    setSelectedName("");
    setSearch("");
    setResults([]);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor="customerSearch">Cliente</Label>

      {value && selectedName ? (
        <div className="flex h-11 items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/40 px-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {selectedName}
            </p>
            <p className="text-xs text-muted-foreground">#{value}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Remover cliente"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {isSearching ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="size-4 text-muted-foreground" />
            )}
          </div>
          <Input
            id="customerSearch"
            type="text"
            autoComplete="off"
            placeholder=""
            value={search}
            onChange={(e) => {
              const next = e.target.value;
              setSearch(next);
              handleSearch(next);
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            className="pl-10"
            disabled={disabled}
          />

          {isOpen && results.length > 0 && (
            <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border/70 bg-background shadow-lg">
              {results.map((customer) => (
                <button
                  key={customer.customerId}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                    "border-b border-border/30 last:border-b-0",
                  )}
                  onClick={() => handleSelect(customer)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {customer.name}
                    </p>
                    <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
                      <span>#{customer.customerId}</span>
                      {customer.cpf && (
                        <>
                          <span className="text-border">·</span>
                          <span>{customer.cpf}</span>
                        </>
                      )}
                      {customer.cnpj && (
                        <>
                          <span className="text-border">·</span>
                          <span>{customer.cnpj}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
