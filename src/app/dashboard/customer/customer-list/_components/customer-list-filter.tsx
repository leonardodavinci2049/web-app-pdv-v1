"use client";

import { Loader2, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";

export function CustomerListFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const trimmed = search.trim();
      const params = new URLSearchParams();
      if (trimmed.length > 2) {
        params.set("search", trimmed);
      }
      startTransition(() => {
        router.push(
          `/dashboard/customer/customer-list${params.toString() ? `?${params.toString()}` : ""}`,
        );
      });
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, router]);

  const handleClear = () => {
    setSearch("");
  };

  return (
    <div className="relative w-full max-w-[400px]">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar por ID, nome, telefone, CPF ou CNPJ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 pr-10"
      />
      {isPending ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )
      )}
    </div>
  );
}
