"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export function BrandSearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [, startTransition] = useTransition();

  const [term, setTerm] = useState(
    searchParams.get("search")?.toString() || "",
  );
  const debouncedTerm = useDebounce(term, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    // Verificar se o valor mudou antes de atualizar a URL para evitar loop
    // Se debouncedTerm for vazio e não tiver search na URL, ou se forem iguais, não faz nada
    if ((params.get("search") || "") === debouncedTerm) {
      return;
    }

    if (debouncedTerm) {
      params.set("search", debouncedTerm);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }, [debouncedTerm, pathname, replace, searchParams]);

  return (
    <div className="relative flex w-full max-w-sm items-center">
      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Pesquisar marcas..."
        className="pl-9 w-full bg-background"
        onChange={(e) => setTerm(e.target.value)}
        value={term}
      />
    </div>
  );
}
