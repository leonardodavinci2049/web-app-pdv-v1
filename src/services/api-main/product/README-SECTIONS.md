# Product Web Sections Service

## Descrição

Serviço para consultar seções web de produtos organizadas por categorias, marcas, tipos e flags comerciais (promoções, destaques, lançamentos).

## Uso Básico

### Importação

```typescript
import { ProductWebServiceApi } from "@/services/api-main/product/product-service-api";
```

### Exemplo 1: Buscar Produtos em Promoção

```typescript
async function getPromotionalProducts() {
  try {
    const response = await ProductWebServiceApi.findProductWebSections({
      pe_flag_promotions: 1,
      pe_qt_registros: 10,
    });

    if (ProductWebServiceApi.isValidProductSections(response)) {
      const products = ProductWebServiceApi.extractProductSections(response);
      return products;
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar produtos em promoção:", error);
    throw error;
  }
}
```

### Exemplo 2: Buscar Lançamentos de uma Marca Específica

```typescript
async function getBrandNewReleases(brandId: number) {
  try {
    const response = await ProductWebServiceApi.findProductWebSections({
      pe_id_marca: brandId,
      pe_flag_lancamento: 1,
      pe_qt_registros: 20,
    });

    if (ProductWebServiceApi.isValidProductSections(response)) {
      const products = ProductWebServiceApi.extractProductSections(response);
      return products;
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar lançamentos da marca:", error);
    throw error;
  }
}
```

### Exemplo 3: Buscar Produtos em Destaque por Categoria

```typescript
async function getHighlightedProductsByCategory(taxonomyId: number) {
  try {
    const response = await ProductWebServiceApi.findProductWebSections({
      pe_id_taxonomy: taxonomyId,
      pe_flag_highlight: 1,
      pe_qt_registros: 12,
      pe_pagina_id: 0,
      pe_coluna_id: 1,
      pe_ordem_id: 1,
    });

    if (ProductWebServiceApi.isValidProductSections(response)) {
      const products = ProductWebServiceApi.extractProductSections(response);
      return products;
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error);
    throw error;
  }
}
```

### Exemplo 4: Server Component (Next.js)

```typescript
// app/sections/promotional/page.tsx
import { ProductWebServiceApi } from "@/services/api-main/product/product-service-api";

export default async function PromotionalSectionPage() {
  const response = await ProductWebServiceApi.findProductWebSections({
    pe_flag_promotions: 1,
    pe_qt_registros: 24,
  });

  const products = ProductWebServiceApi.extractProductSections(response);

  return (
    <div className="container">
      <h1>Produtos em Promoção</h1>
      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.ID_PRODUTO} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Exemplo 5: Combinação de Filtros

```typescript
async function getFilteredSection() {
  try {
    const response = await ProductWebServiceApi.findProductWebSections({
      pe_id_taxonomy: 10, // Categoria específica
      pe_id_marca: 5, // Marca específica
      pe_id_tipo: 2, // Tipo de produto
      pe_flag_promotions: 1, // Apenas promoções
      pe_flag_highlight: 0, // Não destacados
      pe_qt_registros: 15,
      pe_pagina_id: 0,
      pe_coluna_id: 1,
      pe_ordem_id: 1,
    });

    if (ProductWebServiceApi.isValidProductSections(response)) {
      const products = ProductWebServiceApi.extractProductSections(response);
      return products;
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar seção filtrada:", error);
    throw error;
  }
}
```

## Parâmetros da Requisição

| Parâmetro | Tipo | Obrigatório | Descrição | Valor Padrão |
|-----------|------|-------------|-----------|--------------|
| `pe_id_taxonomy` | `number` | Não | ID da taxonomia/categoria | `0` |
| `pe_id_marca` | `number` | Não | ID da marca | `0` |
| `pe_id_tipo` | `number` | Não | ID do tipo de produto | `0` |
| `pe_flag_promotions` | `number` | Não | Flag de promoção (0/1) | `0` |
| `pe_flag_highlight` | `number` | Não | Flag de destaque (0/1) | `0` |
| `pe_flag_lancamento` | `number` | Não | Flag de lançamento (0/1) | `0` |
| `pe_qt_registros` | `number` | Não | Quantidade de registros | `20` |
| `pe_pagina_id` | `number` | Não | ID da página | `0` |
| `pe_coluna_id` | `number` | Não | ID da coluna | `1` |
| `pe_ordem_id` | `number` | Não | ID da ordenação | `1` |

## Estrutura de Resposta

### ProductWebSectionItem

```typescript
interface ProductWebSectionItem {
  ID_PRODUTO: number;
  SKU?: number;
  PRODUTO?: string;
  DESCRICAO_TAB?: string;
  ETIQUETA?: string;
  REF?: string;
  MODELO?: string;
  TIPO?: string;
  MARCA?: string;
  PATH_IMAGEM_MARCA?: string;
  PATH_IMAGEM?: string | null;
  SLUG?: string | null;
  ESTOQUE_LOJA?: number;
  OURO?: number;
  PRATA?: number;
  BRONZE?: number;
  VL_ATACADO?: number;
  VL_CORPORATIVO?: number;
  VL_VAREJO?: number;
  DECONTO?: number;
  TEMPODEGARANTIA_DIA?: number;
  DESCRICAO_VENDA?: string | null;
  IMPORTADO?: number;
  PROMOCAO?: number;
  LANCAMENTO?: number;
  DATADOCADASTRO?: Date;
}
```

## Métodos Auxiliares

### `extractProductSections()`

Extrai o array de produtos da resposta.

```typescript
const products = ProductWebServiceApi.extractProductSections(response);
```

### `isValidProductSections()`

Valida se a resposta contém seções de produtos válidas.

```typescript
if (ProductWebServiceApi.isValidProductSections(response)) {
  // Processar produtos
}
```

## Tratamento de Erros

O serviço lança as seguintes exceções:

- `ProductWebError`: Erro genérico ao buscar seções
- `ProductWebValidationError`: Erro de validação de parâmetros

```typescript
try {
  const response = await ProductWebServiceApi.findProductWebSections(params);
} catch (error) {
  if (error instanceof ProductWebValidationError) {
    console.error("Parâmetros inválidos:", error.validationErrors);
  } else if (error instanceof ProductWebError) {
    console.error("Erro na API:", error.message, error.statusCode);
  } else {
    console.error("Erro desconhecido:", error);
  }
}
```

## Boas Práticas

1. **Cache**: Implemente cache de curta duração (até 5 minutos) para otimizar performance
2. **Paginação**: Use `pe_qt_registros` para limitar resultados e melhorar tempo de resposta
3. **Validação de Imagens**: Sempre valide URLs de `PATH_IMAGEM` antes de renderizar
4. **Combinação de Filtros**: Use múltiplos filtros para curadoria precisa de produtos
5. **Server Components**: Prefira usar em Server Components do Next.js quando possível

## Diferenças entre Endpoints

| Endpoint | Caso de Uso | Características |
|----------|-------------|-----------------|
| `findProductById` | Detalhes de produto único | Retorna dados completos + taxonomias |
| `findProducts` | Listagem geral | Suporta busca por nome, categoria, marca |
| `findProductWebSections` | Seções de vitrine | Focado em flags comerciais e curadorias |

## Referências

- [API Reference](/.github/api-reference/api-reference-main/api-product-reference/product-web-sections.md)
- [Product Types](/src/services/api-main/product/types/product-types.ts)
- [Product Schemas](/src/services/api-main/product/validation/product-schemas.ts)
