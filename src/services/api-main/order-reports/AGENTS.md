# Agent Guidelines for order-reports module

## Visão Geral

Este módulo gerencia as consultas de relatórios de pedidos da API principal.
Todos os endpoints são de leitura (find/list), organizados por contexto: cliente, últimos pedidos, vendas e vendedor.

## Estrutura

```
order-reports/
├── types/order-reports-types.ts          # Interfaces de entidade, request/response e erros
├── validation/order-reports-schemas.ts    # Schemas Zod para validação
├── transformers/transformers.ts           # Transformação Entity → UI
├── order-reports-service-api.ts           # Serviço API com 7 métodos de consulta
├── order-reports-cached-service.ts        # Camada de cache com "use cache"
├── index.ts                               # Exports do módulo
└── AGENTS.md                              # Este arquivo
```

## Endpoints (7 de leitura)

| Método              | Endpoint                                           | Descrição                        |
| ------------------- | -------------------------------------------------- | -------------------------------- |
| `findCustomerAll`   | `/order-reports/v2/order-find-customer-all`        | Listar pedidos por cliente       |
| `findCustomerId`    | `/order-reports/v2/order-find-customer-id`         | Detalhes do pedido por cliente   |
| `findLatestAll`     | `/order-reports/v2/order-find-latest-all`          | Listar últimos pedidos           |
| `findLatestId`      | `/order-reports/v2/order-find-latest-id`           | Detalhes do último pedido        |
| `findSaleAll`       | `/order-reports/v2/order-find-sale-all`            | Listar todas as vendas           |
| `findSaleId`        | `/order-reports/v2/order-find-sale-id`             | Detalhes da venda                |
| `findSellerAll`     | `/order-reports/v2/order-find-seller-all`          | Listar pedidos por vendedor      |

## Padrões

- Cache: `cacheLife("seconds")` para listas, `cacheLife("hours")` para detalhe
- Tags: `CACHE_TAGS.orderReports` (listas), `CACHE_TAGS.orderReport(id)` (detalhe)
- Validação: Zod schemas com `.partial().parse()` para listas, `.parse()` para detalhe
- Erros: `OrderReportsError`, `OrderReportsNotFoundError`, `OrderReportsValidationError`
- Respostas multi-dataset: endpoints by-id retornam múltiplos conjuntos de dados (summary, items, history, customer, seller)
