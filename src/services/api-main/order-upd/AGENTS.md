# Agent Guidelines for order-upd module

## Visão Geral

Este módulo gerencia as operações de atualização (mutation) de pedidos.
Todos os 7 endpoints são de escrita (update), sem camada de cache.

## Estrutura

```
order-upd/
├── types/order-upd-types.ts          # Interfaces de request/response, SP response e erros
├── validation/order-upd-schemas.ts    # Schemas Zod para validação
├── order-upd-service-api.ts           # Serviço API com 7 métodos de atualização
├── index.ts                            # Exports do módulo
└── AGENTS.md                           # Este arquivo
```

## Endpoints (7 de escrita)

| Método           | Endpoint                                    | Parâmetro único   | Descrição                         |
| ---------------- | ------------------------------------------- | ----------------- | --------------------------------- |
| `updateCustomer` | `/order-upd/v2/order-upd-customer-id`      | `pe_customer_id`  | Atualizar cliente do pedido       |
| `updateDiscount` | `/order-upd/v2/order-upd-discount-id`      | `pe_discount_value` | Atualizar desconto do pedido    |
| `updateFrete`    | `/order-upd/v2/order-upd-frete-id`         | `pe_frete_value`  | Atualizar frete do pedido         |
| `updateNotes`    | `/order-upd/v2/order-upd-notes-id`         | `pe_notes`        | Atualizar anotações do pedido     |
| `updatePgMethod` | `/order-upd/v2/order-upd-pg-method-id`     | `pe_pg_method_id` | Atualizar forma de pagamento      |
| `updateSeller`   | `/order-upd/v2/order-upd-seller-id`        | `pe_seller_id`    | Atualizar vendedor do pedido      |
| `updateStatus`   | `/order-upd/v2/order-upd-status-id`        | `pe_status_id`    | Atualizar status do pedido        |

## Padrões

- SEM cached service (endpoints de mutação)
- Todos retornam `StoredProcedureResponse[]` com `sp_return_id`, `sp_message`, `sp_error_id`
- Validação SP: `sp_error_id !== 0` lança `OrderUpdError`
- `pe_notes` é o único parâmetro opcional (string, max 500 chars)
- Todos os outros parâmetros únicos são `number` e obrigatórios
