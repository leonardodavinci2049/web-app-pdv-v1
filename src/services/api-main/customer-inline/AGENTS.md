# Agent Guidelines - Customer Inline API Service

Este documento define convenções e padrões específicos para o módulo de atualização inline de clientes (`src/services/api-main/customer-inline`).

## Arquitetura

O módulo segue um padrão **somente mutação** (sem cache nem transformers) para integração com API externa:

```
customer-inline/
├── customer-inline-service-api.ts     # Classe principal - integração direta com API
├── index.ts                           # Exportações públicas
├── types/
│   └── customer-inline-types.ts       # Interfaces TypeScript (API response, errors)
└── validation/
    └── customer-inline-schemas.ts     # Schemas Zod (validação de request/response)
```

## Responsabilidades

### 1. `customer-inline-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Métodos de mutação** (atualização de campo individual):
  - `updateEmail` — atualiza email do cliente
  - `updateName` — atualiza nome do cliente
  - `updateNotes` — atualiza anotações do cliente
  - `updatePhone` — atualiza telefone do cliente
  - `updateSellerId` — atualiza vendedor associado
  - `updateTypeCustomer` — atualiza tipo de cliente
  - `updateTypePerson` — atualiza tipo de pessoa
  - `updateWhatsapp` — atualiza WhatsApp do cliente
- **Helper**: `extractStoredProcedureResult`
- **Exporta** instância singleton `customerInlineServiceApi`

### 2. `types/customer-inline-types.ts`
- Interfaces para requests/responses por campo e classes de erro (`CustomerInlineError`, `CustomerInlineNotFoundError`, `CustomerInlineValidationError`)

### 3. `validation/customer-inline-schemas.ts`
- Schemas Zod individuais por campo (email, name, notes, phone, seller_id, type_customer, type_person, whatsapp)

## Observações
- **Não possui** camada de cache (apenas mutações)
- **Não possui** transformers (retorno direto da stored procedure)
- Cada método atualiza **um único campo** do cliente (edição inline na UI)

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `updateEmail` | `/customer-inline/v2/customer-upd-inline-email` | Mutação |
| `updateName` | `/customer-inline/v2/customer-upd-inline-name` | Mutação |
| `updateNotes` | `/customer-inline/v2/customer-upd-inline-notes` | Mutação |
| `updatePhone` | `/customer-inline/v2/customer-upd-inline-phone` | Mutação |
| `updateSellerId` | `/customer-inline/v2/customer-upd-inline-seller-id` | Mutação |
| `updateTypeCustomer` | `/customer-inline/v2/customer-upd-inline-type-customer` | Mutação |
| `updateTypePerson` | `/customer-inline/v2/customer-upd-inline-type-person` | Mutação |
| `updateWhatsapp` | `/customer-inline/v2/customer-upd-inline-whatsapp` | Mutação |
