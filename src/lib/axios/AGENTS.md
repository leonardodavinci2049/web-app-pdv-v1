# Camada de Conexão API (Axios) - Agent Guide

Esta pasta contém a base da infraestrutura de comunicação REST do projeto.

## Componentes Principais

### 1. `serverAxiosClient` (`server-axios-client.ts`)
- **Uso:** Exclusivo para Server Components, API Routes e Server Actions.
- **Padrão:** Singleton Otimizado. A instância do Axios é criada uma única vez no constructor.
- **Funcionalidades:** 
  - Injeção automática de `API_KEY` via header `Authorization: Bearer ...`.
  - Retry automático para métodos idempotentes (GET, PUT, DELETE) em erros 5xx/Network.
  - Logging padronizado via `createLogger("ServerAxiosClient")`.
- **Restrição:** Possui a diretiva `"server-only"`.

### 2. `BaseApiService` (`base-api-service.ts`)
- **Finalidade:** Classe abstrata para todos os serviços de API.
- **Responsabilidades:**
  - Métodos protegidos `get`, `post`, `put`, `patch`, `delete`.
  - `handleError`: Converte erros do Axios em classes tipadas (`ApiValidationError`, `ApiServerError`, etc.).
  - `normalizeEmptyResponse`: Utilitário para transformar status codes de negócio (100404, 100422, 100204) em respostas de sucesso vazias (`quantity: 0`).
- **Tratamento de Erros:** Classes de erro possuem `message` (interna/técnica) e `userMessage` (amigável para UI).

## Diretrizes para Agentes
- **Não crie novos clientes Axios.** Use sempre o `serverAxiosClient` através da herança da `BaseApiService`.
- **Tratamento de Resposta:** O `BaseApiService` NÃO lança erro para status codes customizados da API (100XXX). A implementação do serviço específico deve analisar o `statusCode` retornado.
- **Segurança:** Nunca exponha a `API_KEY` ou logs de dados sensíveis no cliente.
