# Agent Guidelines for order-sales module

## Visão Geral

Este módulo gerencia as consultas de dados individuais de pedidos de venda.
Todos os 11 endpoints são de leitura (find by ID), cada um retornando um aspecto específico do pedido.

## Estrutura

```
order-sales/
├── types/order-sales-types.ts          # Interfaces de entidade, request/response e erros
├── validation/order-sales-schemas.ts    # Schemas Zod para validação
├── transformers/transformers.ts         # Transformação Entity → UI
├── order-sales-service-api.ts           # Serviço API com 11 métodos de consulta
├── order-sales-cached-service.ts        # Camada de cache com "use cache"
├── index.ts                              # Exports do módulo
└── AGENTS.md                             # Este arquivo
```

## Endpoints (11 de leitura)

| Método             | Endpoint                                           | Data Key           | Descrição                        |
| ------------------ | -------------------------------------------------- | ------------------ | -------------------------------- |
| `findCoCarrierId`  | `/order-sales/v2/order-find-co-carrier-id`         | `Order Carrier`    | Transportadora do pedido         |
| `findCoCustomerId` | `/order-sales/v2/order-find-co-customer-id`        | `Order Customer`   | Cliente do pedido                |
| `findCoDeliveryId` | `/order-sales/v2/order-find-co-delivery-id`        | `Order Delivery`   | Entrega do pedido                |
| `findCoHistoryId`  | `/order-sales/v2/order-find-co-history-id`         | `Order History`    | Histórico do pedido              |
| `findCoNfId`       | `/order-sales/v2/order-find-co-nf-id`              | `Order Nf`         | Nota fiscal do pedido            |
| `findCoPgFormaId`  | `/order-sales/v2/order-find-co-pg-forma-id`        | `Order Pg Forma`   | Forma de pagamento do pedido     |
| `findCoProtocolId` | `/order-sales/v2/order-find-co-protocol-id`        | `Order Protocol`   | Protocolo do pedido              |
| `findCoSellerId`   | `/order-sales/v2/order-find-co-seller-id`          | `Order Seller`     | Vendedor do pedido               |
| `findCoSummaryId`  | `/order-sales/v2/order-find-co-summary-id`         | `Order Summary`    | Resumo do pedido                 |
| `findDashboardId`  | `/order-sales/v2/order-find-dashboard-id`          | Multi-dataset      | Dashboard completo (4 datasets)  |
| `findEquipmentId`  | `/order-sales/v2/order-find-equipment-id`          | `Order Equipment`  | Equipamento do pedido            |

## Padrões

- Cache: `cacheLife("hours")` para todos (são consultas por ID)
- Tags: `CACHE_TAGS.orderSale(id)`, `CACHE_TAGS.orderSales`
- Dashboard: endpoint especial com 4 datasets (Summary, Details, Items, Customer)
- Parâmetro extra: dashboard aceita `pe_id_seller` opcional
