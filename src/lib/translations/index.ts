/**
 * Exportações centrais para o sistema de traduções
 *
 * Este arquivo centraliza todas as importações de traduções
 * e fornece tipagem TypeScript baseada nas chaves disponíveis
 */

import enTranslations from "./en.json";
import ptTranslations from "./pt.json";

export { default as en } from "./en.json";
// Exporta traduções
export { default as pt } from "./pt.json";

// Tipo para as chaves de tradução baseado na estrutura do arquivo pt.json
export type TranslationKey = keyof typeof ptTranslations;

// Tipo recursivo para chaves aninhadas (auth.login.title, etc.)
export type NestedTranslationKey<T, K = keyof T> = K extends keyof T
  ? T[K] extends Record<string, unknown>
    ? `${K & string}.${NestedTranslationKey<T[K]>}`
    : K & string
  : never;

// Tipo completo para todas as chaves possíveis
export type AllTranslationKeys = NestedTranslationKey<typeof ptTranslations>;

// Validação de completude das traduções
export function validateTranslations() {
  const ptKeys = JSON.stringify(ptTranslations);
  const enKeys = JSON.stringify(enTranslations);

  // Estruturas básicas devem ser iguais (mesmo que valores diferentes)
  const ptStructure = ptKeys.replace(/"[^"]*":\s*"[^"]*"/g, '""');
  const enStructure = enKeys.replace(/"[^"]*":\s*"[^"]*"/g, '""');

  if (ptStructure !== enStructure) {
    console.warn(
      "Traduções têm estruturas diferentes! Algumas chaves podem estar faltando.",
    );
  }
}

// Utilitário para obter todas as chaves de tradução
export function getTranslationKeys(
  obj: Record<string, unknown>,
  prefix = "",
): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      keys.push(
        ...getTranslationKeys(value as Record<string, unknown>, fullKey),
      );
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Lista de todas as chaves disponíveis em português
export const availableKeys = getTranslationKeys(ptTranslations);

// Metadados das traduções
export const translationsMetadata = {
  pt: {
    name: "Português",
    locale: "pt-BR",
    flag: "🇧🇷",
    totalKeys: availableKeys.length,
  },
  en: {
    name: "English",
    locale: "en-US",
    flag: "🇺🇸",
    totalKeys: getTranslationKeys(enTranslations).length,
  },
} as const;

// Valida traduções ao importar (apenas em desenvolvimento)
if (process.env.NODE_ENV === "development") {
  validateTranslations();
}
