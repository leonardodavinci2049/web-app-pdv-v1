# Agent Guidelines - Customer Update API Service

Este documento define convenções e padrões específicos para o módulo de atualização de seções do cadastro de clientes (`src/services/api-main/customer-upd`).

## Arquitetura

O módulo segue um padrão **somente mutação** (sem cache nem transformers) para integração com API externa:

```
customer-upd/
├── customer-upd-service-api.ts     # Classe principal - integração direta com API
├── index.ts                        # Exportações públicas
├── types/
│   └── customer-upd-types.ts       # Interfaces TypeScript (API response, errors)
└── validation/
    └── customer-upd-schemas.ts     # Schemas Zod (validação de request/response)
```

## Responsabilidades

### 1. `customer-upd-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Métodos de mutação** (atualização por seção do cadastro):
  - `updateGeneral` — atualiza informações gerais
  - `updatePersonal` — atualiza informações pessoais
  - `updateBusiness` — atualiza informações empresariais
  - `updateAddress` — atualiza endereço
  - `updateInternet` — atualiza informações de internet/redes sociais
  - `updateFlag` — atualiza flags/configurações
- **Helper**: `extractStoredProcedureResult`
- **Exporta** instância singleton `customerUpdServiceApi`

### 2. `types/customer-upd-types.ts`
- Interfaces para requests/responses por seção e classes de erro (`CustomerUpdError`, `CustomerUpdNotFoundError`, `CustomerUpdValidationError`)

### 3. `validation/customer-upd-schemas.ts`
- Schemas Zod individuais por seção (general, personal, business, address, internet, flag)

## Observações
- **Não possui** camada de cache (apenas mutações)
- **Não possui** transformers (retorno direto da stored procedure)
- Cada método atualiza **uma seção completa** do cadastro do cliente (diferente do customer-inline que atualiza campo individual)

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `updateGeneral` | `/customer-upd/v2/customer-upd-general` | Mutação |
| `updatePersonal` | `/customer-upd/v2/customer-upd-personal` | Mutação |
| `updateBusiness` | `/customer-upd/v2/customer-upd-business` | Mutação |
| `updateAddress` | `/customer-upd/v2/customer-upd-address` | Mutação |
| `updateInternet` | `/customer-upd/v2/customer-upd-internet` | Mutação |
| `updateFlag` | `/customer-upd/v2/customer-upd-flag` | Mutação |
