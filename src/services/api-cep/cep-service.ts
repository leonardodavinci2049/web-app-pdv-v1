/**
 * Serviço para busca de CEP via ViaCEP API
 */

import type { AddressData, ViaCepResponse } from "./types/cep.types";

/**
 * Funções utilitárias para busca de CEP via ViaCEP API
 */

const VIACEP_BASE_URL = "https://viacep.com.br/ws";
const TIMEOUT = 5000; // 5 segundos

/**
 * Normaliza o CEP removendo caracteres não numéricos
 */
function normalizeCep(cep: string): string {
  return cep.replace(/\D/g, "");
}

/**
 * Valida se o CEP possui formato correto
 */
export function validateCep(cep: string): boolean {
  const normalizedCep = normalizeCep(cep);
  return /^[0-9]{8}$/.test(normalizedCep);
}

/**
 * Formata o CEP para exibição
 */
export function formatCep(cep: string): string {
  const normalizedCep = normalizeCep(cep);
  if (normalizedCep.length === 8) {
    return `${normalizedCep.slice(0, 5)}-${normalizedCep.slice(5)}`;
  }
  return cep;
}

/**
 * Busca informações do endereço via ViaCEP
 */
export async function fetchAddressByCep(
  cep: string,
): Promise<AddressData | null> {
  const normalizedCep = normalizeCep(cep);

  // Validar formato do CEP
  if (!validateCep(normalizedCep)) {
    throw new Error("CEP deve conter 8 dígitos numéricos");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(`${VIACEP_BASE_URL}/${normalizedCep}/json/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Erro na busca: ${response.status} ${response.statusText}`,
      );
    }

    const data: ViaCepResponse = await response.json();

    // Verificar se o CEP foi encontrado
    if (data.erro) {
      throw new Error("CEP não encontrado");
    }

    // Converter para formato normalizado
    return {
      street: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
      cep: formatCep(data.cep) || "",
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Tempo limite excedido na busca do CEP");
      }
      throw error;
    }
    throw new Error("Erro desconhecido na busca do CEP");
  }
}

/**
 * Busca múltiplos endereços (para auto-complete)
 * Busca por UF, cidade e logradouro
 */
export async function searchAddresses(
  uf: string,
  city: string,
  street: string,
): Promise<ViaCepResponse[]> {
  if (!uf || !city || !street || street.length < 3) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(
      `${VIACEP_BASE_URL}/${uf}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.status}`);
    }

    const data = await response.json();

    // ViaCEP pode retornar um array ou um objeto de erro
    if (Array.isArray(data)) {
      return data.filter((item: ViaCepResponse) => !item.erro);
    }

    return [];
  } catch (error) {
    console.error("Erro na busca de endereços:", error);
    return [];
  }
}

/**
 * Hook para buscar CEP no lado do cliente
 */
export const useCepLookup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupCep = useCallback(
    async (cep: string): Promise<AddressData | null> => {
      if (!validateCep(cep)) {
        setError("CEP deve conter 8 dígitos");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const addressData = await fetchAddressByCep(cep);
        return addressData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao buscar CEP";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    lookupCep,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

// Importações necessárias para o hook
import { useCallback, useState } from "react";
