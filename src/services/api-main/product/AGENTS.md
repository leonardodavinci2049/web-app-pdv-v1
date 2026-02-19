# Domínio de Produto (API Main) - Agent Guide

Esta pasta gerencia a integração de produtos web, desde a chamada bruta à API até a entrega otimizada com cache para a UI.

## Fluxo de Dados

1. **`product-service-api.ts` (Raw Service):**
   - Instância Singleton: `productServiceApi`.
   - Realiza validação Zod preventiva dos parâmetros.
   - Monta o `buildBasePayload` (APP_ID, STORE_ID, etc.).
   - Trata erros de negócio específicos (ex: `ProductWebNotFoundError`).
   - Retorna tipos puros da API (`ProductWebFindResponse`, etc.).

2. **`transformers/transformers.ts`:**
   - Converte entidades complexas da API para interfaces `UIProduct` simplificadas.
   - **Importante:** Sempre possui `"server-only"`.

3. **`product-web-cached-service.ts` (Cached Service):**
   - Camada consumida pelos Server Components.
   - Usa a diretiva `"use cache"`.
   - **Estratégia de Cache:**
     - `frequent`: Para listagens e filtros (5-15 min).
     - `hours`: Para detalhes de produto (1-24 horas).
   - Usa `cacheTag(CACHE_TAGS.products)` para permitir invalidação futura.

## Convenções de Código
- **Novos Endpoints:** Se adicionar um método em `productServiceApi`, adicione a contraparte correspondente em `product-web-cached-service` se for para exibição na UI.
- **Validação:** Mantenha os schemas Zod atualizados em `validation/product-schemas.ts`.
- **Tratamento de Erros:** O cached service deve capturar erros, logar via `logger` e retornar `[]` ou `undefined` para evitar quebra da UI (Graceful Degradation).

## Consultas Comuns
- Para buscar por ID/Slug: Use `getProductById` ou `getProductBySlug`.
- Para listagens: Use `getProducts` ou `getProductsByTaxonomy`.
