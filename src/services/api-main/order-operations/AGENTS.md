# Agent Guidelines - Order Operations API Service

Este documento define convenções e padrões específicos para o módulo de operações de pedido (`src/services/api-main/order-operations`).

## Arquitetura

```
order-operations/
├── order-operations-service-api.ts  # Classe principal - integração direta com API
├── index.ts                         # Exportações públicas
├── types/
│   └── order-operations-types.ts    # Interfaces TypeScript
├── validation/
│   └── order-operations-schemas.ts  # Schemas Zod
└── transformers/
    └── transformers.ts              # Entity → DTO (para dados do envio por e-mail)
```

**Nota**: Este módulo NÃO possui `cached-service` pois todos os endpoints são de mutação/operação.

## Responsabilidades

### 1. `order-operations-service-api.ts`
- **Métodos**: `createOrder`, `addItem`, `closeOrder`, `reverseOrder`, `sendByEmail`
- **Exporta** instância singleton `orderOperationsServiceApi`

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `createOrder` | `/order-operation/v2/order-oper-create` | Mutação |
| `addItem` | `/order-operation/v2/order-oper-add-item` | Mutação |
| `closeOrder` | `/order-operation/v2/order-oper-close-id` | Operação |
| `reverseOrder` | `/order-operation/v2/order-oper-reverse-id` | Operação |
| `sendByEmail` | `/order-operation/v2/order-oper-sending-by-email` | Operação |
