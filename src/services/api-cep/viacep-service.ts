/**
 * Serviço para integração com a API ViaCEP
 * Documentação: https://viacep.com.br/
 */

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Busca informações de endereço por CEP na API ViaCEP
 */
export async function fetchAddressByCEP(
  cep: string,
): Promise<ViaCEPResponse | null> {
  try {
    // Remove caracteres não numéricos
    const cleanCEP = cep.replace(/\D/g, "");

    // Valida se o CEP tem 8 dígitos
    if (cleanCEP.length !== 8) {
      return null;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Erro na resposta da API ViaCEP:", response.status);
      return null;
    }

    const data: ViaCEPResponse = await response.json();

    // Verificar se retornou erro
    if (data.erro) {
      console.error("CEP não encontrado na API ViaCEP");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
}
