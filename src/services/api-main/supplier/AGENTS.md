# Agent Guidelines - Supplier API Service

Este documento define convenções e padrões específicos para o módulo de fornecedores (`src/services/api-main/supplier`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
supplier/
├── supplier-service-api.ts       # Classe principal - integração direta com API
├── supplier-cached-service.ts    # Funções com cache para Server Components (apenas leitura)
├── index.ts                      # Exportações públicas
├── types/
│   └── supplier-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── supplier-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts           # Entity → DTO (API response → UI models)
```

## Responsabilidades

### 1. `supplier-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Métodos de leitura**: `findAllSuppliers`, `findSupplierById`, `findAllSupplierRelProds`
- **Métodos de mutação**: `createSupplier`, `updateSupplier`, `deleteSupplier`, `createSupplierRelation`, `deleteSupplierRelation`
- **Helpers**: `extractSuppliers`, `extractSupplierById`, `extractSupplierRelProds`, `extractStoredProcedureResult`, `isValidSupplierList`
- **Exporta** instância singleton `supplierServiceApi`

### 2. `supplier-cached-service.ts` (Camada de Cache - Apenas Leitura)
- `getSuppliers`: cache `seconds` + tag `suppliers`
- `getSupplierById`: cache `hours` + tags `supplier(id)`, `suppliers`
- `getSupplierRelProds`: cache `seconds` + tag `suppliersRelProd`

### 3. `types/supplier-types.ts`
- Interfaces para requests, responses, entidades da API e classes de erro (`SupplierError`, `SupplierNotFoundError`)
- Tipos específicos para relacionamento fornecedor-produto (`SupplierRelCreateRequest`, `SupplierRelDeleteRequest`, etc.)

### 4. `validation/supplier-schemas.ts`
- Schemas Zod para todas as operações (CRUD + relacionamento fornecedor-produto)

### 5. `transformers/transformers.ts`
- `UISupplier`, `UISupplierRelProd` para front-end
- Funções de transformação Entity→DTO (`transformSupplier`, `transformSupplierList`, `transformSupplierRelProdList`)

## Observações
- Além do CRUD básico, gerencia **relacionamento fornecedor-produto** (criar, excluir, listar)

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `findAllSuppliers` | `/supplier/v2/supplier-find-all` | Leitura |
| `findSupplierById` | `/supplier/v2/supplier-find-id` | Leitura |
| `createSupplier` | `/supplier/v2/supplier-create` | Mutação |
| `updateSupplier` | `/supplier/v2/supplier-update` | Mutação |
| `deleteSupplier` | `/supplier/v2/supplier-delete` | Mutação |
| `createSupplierRelation` | `/supplier/v2/supplier-rel-create` | Mutação |
| `deleteSupplierRelation` | `/supplier/v2/supplier-rel-delete` | Mutação |
| `findAllSupplierRelProds` | `/supplier/v2/supplier-rel-find-prod-all` | Leitura |
