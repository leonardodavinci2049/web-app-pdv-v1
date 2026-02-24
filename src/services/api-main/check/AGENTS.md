# Agent Guidelines - Check API Service

Este documento define convenções e padrões específicos para o módulo de validação/verificação de duplicidade (`src/services/api-main/check`).

## Arquitetura

O módulo segue um padrão **simplificado** (sem cache nem transformers) para integração com API externa:

```
check/
├── check-service-api.ts     # Classe principal - integração direta com API
├── index.ts                 # Exportações públicas
├── types/
│   └── check-types.ts       # Interfaces TypeScript (API response, errors)
└── validation/
    └── check-schemas.ts     # Schemas Zod (validação de request/response)
```

## Responsabilidades

### 1. `check-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod via `CheckTermSchema`
- **Método genérico privado**: `checkTerm` - reutilizado por todos os métodos públicos
- **Métodos públicos**: `checkIfEmailExists`, `checkIfCpfExists`, `checkIfCnpjExists`, `checkIfTaxonomyNameExists`, `checkIfTaxonomySlugExists`, `checkIfProductNameExists`, `checkIfProductSlugExists`
- **Helpers**: `extractCheckResult`, `isTermAvailable`
- **Exporta** instância singleton `checkServiceApi`

### 2. `types/check-types.ts`
- Interfaces para requests, responses e classes de erro (`CheckError`, `CheckValidationError`)
- `StoredProcedureResponse` para resultado da verificação

### 3. `validation/check-schemas.ts`
- Schema Zod único `CheckTermSchema` compartilhado por todas as verificações

## Observações
- **Não possui** camada de cache (verificações devem ser em tempo real)
- **Não possui** transformers (retorno direto da stored procedure)
- Todos os métodos usam o mesmo formato de request (`CheckTermRequest`)
- `isTermAvailable` retorna `true` quando o termo **não existe** (`sp_return_id === 0`)

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `checkIfEmailExists` | `/check/v3/check-if-email-exists` | Verificação |
| `checkIfCpfExists` | `/check/v3/check-if-cpf-exists` | Verificação |
| `checkIfCnpjExists` | `/check/v3/check-if-cnpj-exists` | Verificação |
| `checkIfTaxonomyNameExists` | `/check/v3/check-if-taxonomy-name-exists` | Verificação |
| `checkIfTaxonomySlugExists` | `/check/v3/check-if-taxonomy-slug-exists` | Verificação |
| `checkIfProductNameExists` | `/check/v3/check-if-product-name-exists` | Verificação |
| `checkIfProductSlugExists` | `/check/v3/check-if-product-slug-exists` | Verificação |
