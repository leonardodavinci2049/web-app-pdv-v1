# Agent Guidelines - Customer General API Service

Este documento define convenções e padrões específicos para o módulo de clientes - operações gerais (`src/services/api-main/customer-general`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
customer-general/
├── customer-general-service-api.ts       # Classe principal - integração direta com API
├── customer-general-cached-service.ts    # Funções com cache para Server Components (apenas leitura)
├── index.ts                              # Exportações públicas
├── types/
│   └── customer-general-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── customer-general-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts                   # Entity → DTO (API response → UI models)
```

## Responsabilidades

### 1. `customer-general-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Métodos de leitura**: `findAllCustomers`, `findCustomerById`, `findLatestProducts`
- **Métodos de mutação**: `createCustomer`
- **Helpers**: `extractCustomers`, `extractCustomerById`, `extractSellerInfo`, `extractLatestProducts`
- **Exporta** instância singleton `customerGeneralServiceApi`

### 2. `customer-general-cached-service.ts` (Camada de Cache - Apenas Leitura)
- `getCustomers`: cache `seconds` + tag `customers`
- `getCustomerById`: cache `hours` + tags `customer(id)`, `customers` — retorna `{ customer, seller }`
- `getCustomerLatestProducts`: cache `seconds` + tags `customerLatestProducts(id)`, `customers`

### 3. `types/customer-general-types.ts`
- Interfaces para requests, responses, entidades da API e classes de erro (`CustomerError`, `CustomerNotFoundError`)

### 4. `validation/customer-general-schemas.ts`
- Schemas Zod para todas as operações (find all, find by id, create, find latest products)

### 5. `transformers/transformers.ts`
- `UICustomerListItem`, `UICustomerDetail`, `UISellerInfo`, `UICustomerLatestProduct` para front-end
- Funções de transformação Entity→DTO

## Observações
- Suporta **paginação** via `pe_qt_registros`, `pe_page_id`, `pe_column_id`, `pe_order_id`
- `findCustomerById` retorna dados do cliente **e** informações do vendedor associado

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `findAllCustomers` | `/customer/v2/customer-find-all` | Leitura |
| `findCustomerById` | `/customer/v2/customer-find-by-id` | Leitura |
| `createCustomer` | `/customer/v2/customer-create` | Mutação |
| `findLatestProducts` | `/customer/v2/customer-find-latest-products` | Leitura |
