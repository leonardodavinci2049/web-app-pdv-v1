"use client";

import { Loader2, Search } from "lucide-react";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CepAddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface CepLookupProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound: (address: CepAddressData) => void;
  disabled?: boolean;
  error?: string;
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

export function CepLookup({
  value,
  onChange,
  onAddressFound,
  disabled,
  error,
}: CepLookupProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const searchCep = useCallback(
    async (cep: string) => {
      const digits = cep.replace(/\D/g, "");
      if (digits.length !== 8) return;

      setIsSearching(true);
      setSearchMessage("");

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${digits}/json/`,
        );
        const data = await response.json();

        if (data.erro) {
          setSearchMessage("CEP não encontrado");
          return;
        }

        onAddressFound({
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        });
        setSearchMessage("Endereço encontrado!");
      } catch {
        setSearchMessage("Erro ao buscar CEP. Tente novamente.");
      } finally {
        setIsSearching(false);
      }
    },
    [onAddressFound],
  );

  const handleChange = (rawValue: string) => {
    const formatted = formatCep(rawValue);
    onChange(formatted);

    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 8) {
      searchCep(formatted);
    } else {
      setSearchMessage("");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cep" className="text-sm font-medium">
        CEP
      </Label>
      <div className="relative">
        <Input
          id="cep"
          name="pe_zip_code"
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="00000-000"
          maxLength={9}
          disabled={disabled || isSearching}
          className={`pr-10 ${error ? "border-red-500" : ""}`}
        />
        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          ) : (
            <Search className="text-muted-foreground h-4 w-4" />
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {searchMessage && !error && (
        <p
          className={`text-xs ${
            searchMessage.includes("encontrado") &&
            !searchMessage.includes("não")
              ? "text-green-600 dark:text-green-400"
              : "text-orange-600 dark:text-orange-400"
          }`}
        >
          {searchMessage}
        </p>
      )}
    </div>
  );
}
