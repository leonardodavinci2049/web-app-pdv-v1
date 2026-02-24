# Agent Guidelines - Carrier API Service

Este documento define convenções e padrões específicos para o módulo de transportadoras (`src/services/api-main/carrier`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
carrier/
├── carrier-service-api.ts       # Classe principal - integração direta com API
├── carrier-cached-service.ts    # Funções com cache para Server Components (apenas leitura)
├── index.ts                     # Exportações públicas
├── types/
│   └── carrier-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── carrier-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts          # Entity → DTO (API response → UI models)
```

## Responsabilidades

### 1. `carrier-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Métodos de leitura**: `findAllCarriers`, `findCarrierById`
- **Métodos de mutação**: `createCarrier`, `updateCarrier`, `deleteCarrier`
- **Helpers**: `extractCarriers`, `extractCarrierById`, `extractStoredProcedureResult`
- **Exporta** instância singleton `carrierServiceApi`

### 2. `carrier-cached-service.ts` (Camada de Cache - Apenas Leitura)
- `getCarriers`: cache `seconds` + tag `carriers`
- `getCarrierById`: cache `hours` + tags `carrier(id)`, `carriers`

### 3. `types/carrier-types.ts`
- Interfaces para requests, responses, entidades da API e classes de erro (`CarrierError`, `CarrierNotFoundError`)

### 4. `validation/carrier-schemas.ts`
- Schemas Zod para todas as operações (find all, find by id, create, update, delete)

### 5. `transformers/transformers.ts`
- `UICarrier` para front-end
- Funções de transformação Entity→DTO (`transformCarrier`, `transformCarrierList`)

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `findAllCarriers` | `/carrier/v2/carrier-find-all` | Leitura |
| `findCarrierById` | `/carrier/v2/carrier-find-id` | Leitura |
| `createCarrier` | `/carrier/v2/carrier-create` | Mutação |
| `updateCarrier` | `/carrier/v2/carrier-update` | Mutação |
| `deleteCarrier` | `/carrier/v2/carrier-delete` | Mutação |
