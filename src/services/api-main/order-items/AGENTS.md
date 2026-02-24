# Agent Guidelines - Order Items API Service

Este documento define convenções e padrões específicos para o módulo de itens de pedido (`src/services/api-main/order-items`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
order-items/
├── order-items-service-api.ts       # Classe principal - integração direta com API
├── order-items-cached-service.ts    # Funções com cache para Server Components (apenas leitura)
├── index.ts                         # Exportações públicas
├── types/
│   └── order-items-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── order-items-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts              # Entity → DTO (API response → UI models)
```

## Responsabilidades

### 1. `order-items-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Métodos de leitura**: `findAllOrderItems`, `findOrderItemById`
- **Métodos de mutação**: `deleteOrderItem`, `updateDiscount`, `updateDiscountAdm`, `updateFreteVl`, `updateInsuranceVl`, `updateNotes`, `updateQuantity`, `updateValue`
- **Exporta** instância singleton `orderItemsServiceApi`

### 2. `order-items-cached-service.ts` (Camada de Cache - Apenas Leitura)
- `getOrderItems`: cache `seconds` + tag `orderItems`
- `getOrderItemById`: cache `hours` + tags `orderItem(id)`, `orderItems`

### 3. `types/order-items-types.ts`
- Interfaces para requests, responses, entidades da API e classes de erro

### 4. `validation/order-items-schemas.ts`
- Schemas Zod para todas as operações

### 5. `transformers/transformers.ts`
- `UIOrderItem` e `UIOrderItemDetail` para front-end
- Funções de transformação Entity→DTO

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `findAllOrderItems` | `/order-items/v2/order-items-find-all` | Leitura |
| `findOrderItemById` | `/order-items/v2/order-items-find-id` | Leitura |
| `deleteOrderItem` | `/order-items/v2/order-items-delete` | Mutação |
| `updateDiscount` | `/order-items/v2/order-items-discount` | Mutação |
| `updateDiscountAdm` | `/order-items/v2/order-items-discount-adm` | Mutação |
| `updateFreteVl` | `/order-items/v2/order-items-frete-vl` | Mutação |
| `updateInsuranceVl` | `/order-items/v2/order-items-insurance-vl` | Mutação |
| `updateNotes` | `/order-items/v2/order-items-notes` | Mutação |
| `updateQuantity` | `/order-items/v2/order-items-qt` | Mutação |
| `updateValue` | `/order-items/v2/order-items-value` | Mutação |
