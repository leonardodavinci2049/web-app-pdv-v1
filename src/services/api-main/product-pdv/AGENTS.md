# Agent Guidelines - Product PDV API Service

Este documento define convenções e padrões específicos para o módulo de serviço de produtos PDV (`src/services/api-main/product-pdv`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
product-pdv/
├── product-pdv-service-api.ts       # Classe principal - integração direta com API
├── product-pdv-cached-service.ts    # Funções com cache para Server Components (apenas leitura)
├── index.ts                         # Exportações públicas
├── types/
│   └── product-pdv-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── product-pdv-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts              # Entity → DTO (API response → UI models)
```

## Responsabilidades

### 1. `product-pdv-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store)
- **Normaliza** respostas de API (NOT_FOUND/EMPTY_RESULT → SUCCESS com array vazio)
- **Extrai** dados da estrutura de resposta da API (`extractProductsPdv`, `extractProductPdvById`)
- **Valida** respostas da API (`isValidProductPdvList`, `isValidProductPdvDetail`)
- **Lança** erros específicos (`ProductPdvError`, `ProductPdvNotFoundError`)
- **Não usa cache** - apenas comunicação direta
- **Exporta** instância singleton `productPdvServiceApi`

### 2. `product-pdv-cached-service.ts` (Camada de Cache - Apenas Leitura)
- **Fornece** funções de leitura para Server Components (`getProductsPdv`, `getProductPdvById`)
- **Usa** Next.js Cache com `cacheLife` e `cacheTag`
- **Transforma** entidades API → DTOs UI via `transformers`
- **Retorna** estruturas simplificadas (`UIProductPdv[]`, `UIProductPdv | undefined`)
- **Trata erros** silenciosamente (return `[]` ou `undefined`)
- **Usa** tags de cache para invalidação: `CACHE_TAGS.productsPdv`, `CACHE_TAGS.productPdv(id)`
- **Guard check**: retorna `[]` imediatamente se `pe_system_client_id` não for fornecido em `getProductsPdv`
- **Guard check**: retorna `undefined` imediatamente se `pe_system_client_id` não for fornecido em `getProductPdvById`

### 3. `types/product-pdv-types.ts`
- Define interfaces base (`ProductPdvBaseRequest`, `ProductPdvBaseResponse`)
- Define interfaces para **requests** (`ProductPdvFindAllRequest`, `ProductPdvFindByIdRequest`)
- Define interfaces para **responses** (`ProductPdvFindAllResponse`, `ProductPdvFindByIdResponse`)
- Define tipos para **entidades** API (`ProductPdvListItem`, `ProductPdvDetail`)
- Define classes de erro customizadas (`ProductPdvError`, `ProductPdvNotFoundError`, `ProductPdvValidationError`)

### 4. `validation/product-pdv-schemas.ts`
- **Valida** entrada de dados com Zod
- Exporta tipos inferidos (`ProductPdvFindAllInput`, `ProductPdvFindByIdInput`)
- Define constraints específicas da API (max length, min values, int)
- Parâmetros de contexto são `.optional()` nos schemas

### 5. `transformers/transformers.ts`
- Define interface `UIProductPdv` para uso no front-end
- **Converte** entidades da API (`ProductPdvListItem`, `ProductPdvDetail`) → DTOs UI (`UIProductPdv`)
- **Normaliza** tipos (ex: `IMPORTADO: number` → `imported: boolean`, `PROMOCAO` → `promotion`)
- **Handle** campos opcionais/null
- Funções: `transformProductPdvListItem`, `transformProductPdvDetail`, `transformProductPdvList`, `transformProductPdvDetailList`, `transformProductPdv`

### 6. `index.ts` (Exportações Públicas)
- Exporta `ProductPdvServiceApi` classe e instância singleton
- Exporta todos os tipos de `product-pdv-types.ts` (requests, responses, entities, errors)
- **Nota**: Funções do `product-pdv-cached-service.ts` devem ser importadas diretamente do arquivo

## Padrões de Código

### Nomes de Parâmetros API
Prefixo `pe_` (parameter):

**Parâmetros de Contexto (opcionais no schema):**
```typescript
pe_system_client_id: number  // ID do cliente do sistema
pe_organization_id: string   // ID da organização (Max 200 chars)
pe_user_id: string           // ID do usuário (Max 200 chars)
pe_user_name: string         // Nome do usuário (Max 200 chars)
pe_user_role: string         // Papel do usuário (Max 200 chars)
pe_person_id: number         // ID da pessoa associada
```

**Parâmetros Específicos de Produto PDV:**
```typescript
pe_search: string            // Termo de busca (Max 300 chars)
pe_taxonomy_id: number       // ID da taxonomia para filtro
pe_type_id: number           // ID do tipo para filtro
pe_brand_id: number          // ID da marca para filtro
pe_flag_stock: number        // Flag de estoque (0 ou 1)
pe_flag_service: number      // Flag de serviço (0 ou 1)
pe_records_quantity: number  // Quantidade de registros por página
pe_page_id: number           // Número da página
pe_column_id: number         // Coluna para ordenação
pe_order_id: number          // Tipo de ordenação (1=ASC, 2=DESC)
pe_product_id: number        // ID do produto
pe_type_business: number     // Tipo de negócio
```

### Estrutura de Resposta da API
```typescript
// FindAll Response
{
  statusCode: number,
  message: string,
  recordId: number,
  data: {
    "Product Pdv find All": ProductPdvListItem[]
  },
  quantity: number,
  errorId: number,
  info1?: string
}

// FindById Response
{
  statusCode: number,
  message: string,
  recordId: string,
  data: {
    "Product Pdv find Id": ProductPdvDetail[]
  },
  quantity: number,
  errorId: number,
  info1?: string
}
```

### Cache Configuration
```typescript
// Leitura de lista - cache de segundos
"use cache"
cacheLife("seconds")
cacheTag(CACHE_TAGS.productsPdv)

// Leitura por ID - cache de horas
"use cache"
cacheLife("hours")
cacheTag(CACHE_TAGS.productPdv(String(id)), CACHE_TAGS.productsPdv)
```

### Endpoints
```typescript
PRODUCT_PDV_ENDPOINTS = {
  FIND_ALL: "/product-pdv/v2/product-pdv-find-all",
  FIND_BY_ID: "/product-pdv/v2/product-pdv-find-id",
}
```
