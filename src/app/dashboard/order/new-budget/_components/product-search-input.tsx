"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useTransition } from "react";

import { Input } from "@/components/ui/input";

interface ProductSearchInputProps {
  defaultValue: string;
  orderId: number;
  customerId: number;
}

export function ProductSearchInput({
  defaultValue,
  orderId,
  customerId,
}: ProductSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("step", "3");
        params.set("orderId", String(orderId));
        params.set("customerId", String(customerId));

        if (value.trim()) {
          params.set("search", value.trim());
        } else {
          params.delete("search");
        }

        startTransition(() => {
          router.push(`/dashboard/order/new-budget?${params.toString()}`);
        });
      }, 400);
    },
    [searchParams, orderId, customerId, router],
  );

  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar por nome, referência, modelo, etiqueta..."
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        className={isPending ? "pl-10 opacity-60" : "pl-10"}
      />
    </div>
  );
}
