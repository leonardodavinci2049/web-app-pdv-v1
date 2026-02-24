# Agent Guidelines - Product Type (Ptype) API Service

Este documento define convenções e padrões específicos para o módulo de tipos de produto (`src/services/api-main/ptype`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
ptype/
├── ptype-service-api.ts       # Classe principal - integração direta com API
├── ptype-cached-service.ts    # Funções com cache para Server Components (apenas leitura)
├── index.ts                   # Exportações públicas
├── types/
│   └── ptype-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── ptype-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts        # Entity → DTO (API response → UI models)
```

## Responsabilidades

### 1. `ptype-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Métodos de leitura**: `findAllPtypes`, `findPtypeById`
- **Métodos de mutação**: `createPtype`, `updatePtype`, `deletePtype`
- **Helpers**: `extractPtypes`, `extractPtypeById`
- **Exporta** instância singleton `ptypeServiceApi`

### 2. `ptype-cached-service.ts` (Camada de Cache - Apenas Leitura)
- `getPtypes`: cache `seconds` + tag `ptypes`
- `getPtypeById`: cache `hours` + tags `ptype(id)`, `ptypes`

### 3. `types/ptype-types.ts`
- Interfaces para requests, responses, entidades da API e classes de erro (`PtypeError`, `PtypeNotFoundError`)

### 4. `validation/ptype-schemas.ts`
- Schemas Zod para todas as operações (find all, find by id, create, update, delete)

### 5. `transformers/transformers.ts`
- `UIPtype` para front-end
- Funções de transformação Entity→DTO (`transformPtype`, `transformPtypeList`)

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `findAllPtypes` | `/ptype/v2/ptype-find-all` | Leitura |
| `findPtypeById` | `/ptype/v2/ptype-find-id` | Leitura |
| `createPtype` | `/ptype/v2/ptype-create` | Mutação |
| `updatePtype` | `/ptype/v2/ptype-update` | Mutação |
| `deletePtype` | `/ptype/v2/ptype-delete` | Mutação |
