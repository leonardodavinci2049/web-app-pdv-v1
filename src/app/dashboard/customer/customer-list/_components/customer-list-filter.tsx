"use client";

import { Search, X } from "lucide-react";
import Form from "next/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CustomerListFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleClear = () => {
    setSearch("");
    router.push("/dashboard/customer/customer-list");
  };

  return (
    <Form
      action="/dashboard/customer/customer-list"
      className="flex w-full items-center gap-3"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          type="search"
          placeholder="Buscar por ID, nome, telefone, CPF ou CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" variant="default">
        Buscar
      </Button>
      {search && (
        <Button type="button" variant="outline" onClick={handleClear}>
          Limpar
        </Button>
      )}
    </Form>
  );
}
