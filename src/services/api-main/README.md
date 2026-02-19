# Camada de Integração de API (Main)

Esta pasta contém os serviços de integração com a API REST principal do ecossistema. A arquitetura segue um padrão de camadas para garantir separação de responsabilidades, cache eficiente e tipagem robusta.

## Estrutura de Pastas Sugerida

Ao adicionar um novo domínio (ex: `brand`, `cart`, `account`), siga esta estrutura:

```
src/services/api-main/nome-do-dominio/
├── types/              # Definições de tipos TypeScript (Entidades e DTOs)
├── validation/         # Schemas de validação Zod para requests/responses
├── transformers/       # Funções que convertem tipos da API para tipos de UI
├── *-service-api.ts    # Classe de serviço raw (Singleton herdando de BaseApiService)
├── *-cached-service.ts # Funções com "use cache" para consumo na UI
└── index.ts            # Barrel exportando as funções do cached service
```

## Padrões de Implementação

### 1. Serviço de API (Raw)
Deve herdar de `BaseApiService` e ser exportado como uma instância **Singleton**.
- Use `this.post`, `this.get`, etc.
- Implemente validação Zod preventiva.
- Use `this.normalizeEmptyResponse` para tratar 404/204 de negócio.

### 2. Cached Service (UI-Ready)
Camada que consome o serviço raw e adiciona as otimizações do Next.js 16.
- Use a diretiva `"use cache"`.
- Utilize perfis de cache consistentes (`frequent`, `hours`, `daily`).
- Aplique `cacheTag` para permitir invalidação granular.
- Chame os `transformers` para entregar dados prontos para os componentes.

### 3. Transformers
- Devem ter a diretiva `"server-only"` no topo.
- Responsáveis por tratar fallbacks de strings vazias, formatação de preços e caminhos de imagem.

## Cache Life Profiles (next.config.ts)

- **frequent**: 5 min (Listagens com filtros, dados que mudam frequentemente)
- **quarter**: 15 min (Menus, navegação)
- **hours**: 1 hora (Detalhes de produto, conteúdo estático)
- **daily**: 24 horas (Configurações globais)

---
*Para mais detalhes sobre a base de conexão, consulte `src/lib/axios/README.md` (se disponível).*
