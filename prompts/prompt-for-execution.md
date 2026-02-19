# Tarefa: Elaborar Plano de Ação para Modernizar a Conexão e o Serviço de API REST

## Papel e Contexto

Você é um engenheiro sênior especialista em Next.js 15/16 e TypeScript. Sua tarefa é analisar a estrutura atual de integração com API REST deste projeto e produzir um plano de ação detalhado com melhorias concretas e priorizadas.

---

## Estrutura Atual — O que Você Precisa Analisar

### 1. Camada de Conexão (`src/lib/axios/`)

| Arquivo | Responsabilidade |
|---|---|
| `axios-client.ts` | Cliente Axios para uso no lado do **cliente (browser)** — sem `server-only` |
| `server-axios-client.ts` | Cliente Axios para uso no **servidor** (Server Components, API Routes, Server Actions) — usa `"server-only"` e injeta `API_KEY` no header `Authorization: Bearer` |
| `base-api-service.ts` | Classe abstrata base (`BaseApiService`) que encapsula todos os métodos HTTP, tratamento de resposta (`handleResponse`) e mapeamento de erros (`handleError`) para erros tipados (`ApiConnectionError`, `ApiValidationError`, `ApiAuthenticationError`, `ApiNotFoundError`, `ApiServerError`) |
| `index.ts` | Barrel de exportações da camada de conexão |

**Pontos relevantes já implementados:**
- `ServerAxiosClient` cria uma nova instância por chamada (`createInstance()`), não reutiliza singleton
- Retry automático com backoff exponencial em `server-axios-client.ts` (max 3 retries, delay base 1s)
- `declare module "axios"` com `metadata` é duplicado em ambos os clientes
- `handleResponseError` em `axios-client.ts` usa `console.warn/error` raw em vez do logger centralizado
- `axiosClient` (browser) não deveria ser utilizado diretamente por Server Components — a responsabilidade está separada por design

### 2. Camada de Serviço (`src/services/api-main/product/`)

| Arquivo | Responsabilidade |
|---|---|
| `product-service-api.ts` | Classe `ProductWebServiceApi extends BaseApiService` — métodos estáticos para consulta da API Web (`findProductById`, `findProducts`, `findProductWebSections`) com validação Zod e construção de payload |
| `product-web-cached-service.ts` | Funções com `"use cache"` do Next.js 16 Cache Components — orquestra chamadas à `ProductWebServiceApi` e expõe dados no formato `UIProduct`/`UICategory` |
| `transformers/transformers.ts` | Funções de transformação Entity → DTO (API response → UI types) |
| `types/product-types.ts` | Tipos TypeScript das respostas da API e erros de domínio |
| `validation/product-schemas.ts` | Schemas Zod para validação de parâmetros de entrada |
| `index.ts` | Barrel de exportações do serviço de produto |

**Pontos relevantes já implementados:**
- Todos os métodos da classe são estáticos — instância criada internamente com `new ProductWebServiceApi()`
- `buildBasePayload` injeta credenciais de ambiente (`APP_ID`, `SYSTEM_CLIENT_ID`, `STORE_ID`, etc.) em todas as requisições
- `handleSearchResponse` e `handleSectionsResponse` normalizam respostas com `statusCode 100204/100404/100422` para arrays vazios com sucesso
- Respostas da API usam códigos customizados (`API_STATUS_CODES`: 100200, 100204, 100400, 100404, 100422)
- `"use cache"` com `cacheLife("hours")` e `cacheTag` de `next/cache` já em uso

---

## Objetivo da Análise

Produza um plano de ação organizado identificando **pontos de melhoria reais** nas duas camadas, com foco em:

1. **Qualidade e manutenibilidade do código**
   - Eliminar duplicações (ex.: `declare module "axios"` duplicado)
   - Melhorar consistência (logging via `createLogger` em vez de `console.*` raw)
   - Avaliar se o padrão de métodos estáticos na `ProductWebServiceApi` é adequado ou se traria benefícios migrar para instância

2. **Alinhamento com padrões do Next.js 16**
   - Verificar se o uso de `"use cache"`, `cacheLife` e `cacheTag` está correto e otimizado
   - Avaliar se há oportunidade de usar `fetch` nativo com cache do Next.js em substituição ao Axios no lado servidor (trade-off entre robustez Axios vs. cache integrado do Next.js)
   - Confirmar separação correta entre código client-side e server-side

3. **Segurança**
   - Garantir que `API_KEY` e variáveis sensíveis nunca vazem para o bundle do cliente
   - Verificar se `"server-only"` está aplicado em todos os arquivos que deveriam ter essa restrição
   - Confirmar que erros internos da API nunca são expostos diretamente ao usuário final

4. **Confiabilidade e resiliência**
   - Avaliar a eficácia do retry em `ServerAxiosClient` (nova instância por chamada vs. singleton)
   - Verificar tratamento de timeouts e casos de indisponibilidade da API
   - Avaliar cobertura do tratamento de erros no fluxo completo

5. **Organização e escalabilidade da pasta de serviços**
   - Avaliar se a estrutura atual da pasta `api-main/product/` é suficientemente clara para escalar para outros domínios (ex.: `brand/` está vazio)
   - Identificar boas práticas que devem ser replicadas para novos serviços

---

## Restrições e Diretrizes

- **NÃO implemente código** nesta tarefa. Produza apenas o plano de ação.
- Cada item do plano deve conter: **descrição do problema atual**, **proposta de melhoria** e **nível de prioridade** (Alta / Média / Baixa).
- Priorize melhorias que tenham impacto real no projeto — evite sugestões genéricas sem aplicabilidade concreta ao código analisado.
- Considere o custo/benefício de cada mudança: mudanças de alto impacto com baixo risco devem vir primeiro.
- Verifique se a versão do Next.js (`"next": "16.1.6"`) com **Cache Components ativo** influencia alguma decisão arquitetural.
- Consulte os arquivos de constantes (`src/core/constants/api-constants.ts`) e configuração (`src/core/config/envs.ts`) para entender o contexto completo antes de propor mudanças.

---

## Entregável

Grave o plano de ação em `/docs/plano-modernizacao-api-rest.md` com a seguinte estrutura:

```markdown
# Plano de Modernização — Camada de Integração API REST

## Sumário Executivo
[Resumo de 3-5 linhas do diagnóstico geral]

## Análise da Camada de Conexão (`src/lib/axios/`)
[Itens identificados com: problema atual, proposta, prioridade]

## Análise da Camada de Serviço (`src/services/api-main/product/`)
[Itens identificados com: problema atual, proposta, prioridade]

## Itens de Alta Prioridade (Ação Imediata)
[Lista consolidada dos itens críticos]

## Roadmap Sugerido
[Ordem de execução recomendada com justificativa]

