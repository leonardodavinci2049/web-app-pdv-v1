# Product Service API - Exemplos de Uso

Este documento contém exemplos práticos de como utilizar o `ProductServiceApi` no projeto.

## Importação

```typescript
import { ProductServiceApi } from '@/services/api/product';
import type {
  FindProductsResponse,
  FindProductByIdResponse,
  CreateProductResponse,
  UpdateProductResponse,
} from '@/services/api/product';
```

## Exemplos de Uso

### 1. Buscar Produto por ID

```typescript
// Buscar produto pelo ID numérico
const productResponse = await ProductServiceApi.findProductById({
  pe_type_business: 1, // 1 = B2B, 2 = B2C
  pe_id_produto: 1505,
  pe_slug_produto: ""
});

// Verificar se a resposta é válida
if (ProductServiceApi.isValidProductDetailResponse(productResponse)) {
  const product = ProductServiceApi.extractProductDetail(productResponse);
  console.log('Produto encontrado:', product);
}
```

```typescript
// Buscar produto pelo slug
const productResponse = await ProductServiceApi.findProductById({
  pe_type_business: 1,
  pe_id_produto: 0,
  pe_slug_produto: "notebook-dell-inspiron-15"
});
```

### 2. Listar Produtos com Filtros

```typescript
// Buscar todos os produtos ativos
const productsResponse = await ProductServiceApi.findProducts({
  pe_flag_inativo: 0,
  pe_qt_registros: 20,
  pe_pagina_id: 0, // Primeira página (paginação 0-based)
});

// Extrair lista de produtos
const products = ProductServiceApi.extractProductList(productsResponse);
console.log(`Encontrados ${products.length} produtos`);
```

```typescript
// Buscar produtos por categoria
const productsResponse = await ProductServiceApi.findProducts({
  pe_id_taxonomy: 825,
  pe_flag_inativo: 0,
  pe_flag_estoque: 1, // Apenas com estoque
  pe_qt_registros: 50,
});
```

```typescript
// Buscar produtos por nome
const productsResponse = await ProductServiceApi.findProducts({
  pe_produto: "NOTEBOOK",
  pe_flag_estoque: 1,
  pe_qt_registros: 10,
  pe_ordem_id: 2, // Ordem decrescente
});
```

### 3. Criar Novo Produto

```typescript
// Criar produto básico (mínimo necessário)
const createResponse = await ProductServiceApi.createProduct({
  pe_type_business: 1,
  pe_nome_produto: "NOTEBOOK LENOVO IDEAPAD 3",
  pe_slug: "notebook-lenovo-ideapad-3",
  pe_ref: "LEN-IDEA3-001",
  pe_modelo: "IDEAPAD 3 15ITL6",
});

// Verificar sucesso e obter ID
if (ProductServiceApi.isOperationSuccessful(createResponse)) {
  const productId = ProductServiceApi.extractRecordId(createResponse);
  console.log(`Produto criado com ID: ${productId}`);
}
```

```typescript
// Criar produto completo
const createResponse = await ProductServiceApi.createProduct({
  pe_type_business: 1,
  pe_nome_produto: "NOTEBOOK LENOVO IDEAPAD 3",
  pe_slug: "notebook-lenovo-ideapad-3-15itl6",
  pe_descricao_tab: "Notebook Lenovo com processador Intel Core i3",
  pe_etiqueta: "7891234567892",
  pe_ref: "LEN-IDEA3-001",
  pe_modelo: "IDEAPAD 3 15ITL6",
  pe_id_fornecedor: 55,
  pe_id_tipo: 10,
  pe_id_marca: 28,
  pe_peso_gr: 1700,
  pe_comprimento_mm: 360,
  pe_largura_mm: 250,
  pe_altura_mm: 20,
  pe_vl_venda_atacado: 2199.90,
  pe_vl_venda_varejo: 2499.90,
  pe_vl_corporativo: 2349.90,
  pe_qt_estoque: 10,
  pe_flag_importado: 1,
});
```

### 4. Atualizar Dados Gerais do Produto

```typescript
const updateResponse = await ProductServiceApi.updateProductGeneral({
  pe_id_produto: 1505,
  pe_nome_produto: "NOTEBOOK LENOVO IDEAPAD 3 82H6",
  pe_ref: "LEN-IDEA3-001-V2",
  pe_modelo: "IDEAPAD 3 15ITL6 82H6",
  pe_etiqueta: "7891234567892",
  pe_descricao_tab: "Notebook Lenovo IdeaPad 3 com Intel Core i3 de 11ª geração",
});

if (ProductServiceApi.isOperationSuccessful(updateResponse)) {
  console.log('Dados gerais atualizados com sucesso');
}
```

### 5. Atualizar Nome do Produto

```typescript
const updateResponse = await ProductServiceApi.updateProductName({
  pe_id_produto: 1505,
  pe_nome_produto: "NOTEBOOK LENOVO IDEAPAD 3 - INTEL CORE I3 11ª GERAÇÃO",
});
```

### 6. Atualizar Estoque

```typescript
const updateResponse = await ProductServiceApi.updateProductStock({
  pe_id_produto: 1505,
  pe_qt_estoque: 50,
  pe_qt_minimo: 10,
});
```

### 7. Atualizar Preços

```typescript
const updateResponse = await ProductServiceApi.updateProductPrice({
  pe_id_produto: 1505,
  pe_preco_venda_atac: 2199.90,
  pe_preco_venda_corporativo: 2349.90,
  pe_preco_venda_vare: 2499.90,
});
```

### 8. Atualizar Flags do Produto

```typescript
const updateResponse = await ProductServiceApi.updateProductFlags({
  pe_id_produto: 1505,
  pe_flag_inativo: 0,
  pe_flag_importado: 1,
  pe_flag_controle_fisico: 1,
  pe_flag_controle_estoque: 1,
  pe_flag_destaque: 1,
  pe_flag_promocao: 0,
  pe_flag_descontinuado: 0,
  pe_flag_servico: 0,
  pe_flag_website_off: 0,
});
```

### 9. Atualizar Características Físicas

```typescript
const updateResponse = await ProductServiceApi.updateProductCharacteristics({
  pe_id_produto: 1505,
  pe_peso_gr: 1700,
  pe_comprimento_mm: 360,
  pe_largura_mm: 250,
  pe_altura_mm: 20,
  pe_diametro_mm: 0,
  pe_tempodegarantia_dia: 365,
  pe_tempodegarantia_mes: 12,
});
```

### 10. Atualizar Valores Fiscais

```typescript
const updateResponse = await ProductServiceApi.updateProductTaxValues({
  pe_id_produto: 1505,
  pe_cfop: "5102",
  pe_cst: "00",
  pe_ean: "7891234567892",
  pe_nbm: "84713012",
  pe_ncm: 84713012,
  pe_ppb: 1,
  pe_temp: 25.0,
});
```

### 11. Atualizar Descrições

```typescript
// Descrição curta (venda)
await ProductServiceApi.updateProductShortDescription({
  pe_id_produto: 1505,
  pe_descricao_venda: "Notebook Lenovo IdeaPad 3 com Intel Core i3, ideal para trabalho e estudos.",
});

// Descrição completa
await ProductServiceApi.updateProductDescription({
  pe_id_produto: 1505,
  pe_produto_descricao: "O Notebook Lenovo IdeaPad 3 é a escolha perfeita para quem busca performance...",
});
```

## Tratamento de Erros

```typescript
try {
  const productResponse = await ProductServiceApi.findProductById({
    pe_type_business: 1,
    pe_id_produto: 9999,
    pe_slug_produto: ""
  });
  
  if (!ProductServiceApi.isValidProductDetailResponse(productResponse)) {
    console.error('Produto não encontrado ou resposta inválida');
  }
} catch (error) {
  console.error('Erro ao buscar produto:', error);
  // Tratar erro apropriadamente (toast, redirect, etc)
}
```

## Uso em Server Components

```typescript
// app/dashboard/product/[id]/page.tsx
import { ProductServiceApi } from '@/services/api/product';

export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const response = await ProductServiceApi.findProductById({
      pe_type_business: 1,
      pe_id_produto: Number(params.id),
      pe_slug_produto: ""
    });
    
    const product = ProductServiceApi.extractProductDetail(response);
    
    if (!product) {
      return <div>Produto não encontrado</div>;
    }
    
    return <div>
      <h1>{product.PRODUTO}</h1>
      <p>Preço: R$ {product.VL_VENDA_VAREJO}</p>
      <p>Estoque: {product.QT_ESTOQUE}</p>
    </div>;
  } catch (error) {
    return <div>Erro ao carregar produto</div>;
  }
}
```

## Uso em Server Actions

```typescript
// app/actions/action-products.ts
"use server";

import { ProductServiceApi } from '@/services/api/product';
import { revalidatePath } from 'next/cache';

export async function createProductAction(formData: FormData) {
  try {
    const response = await ProductServiceApi.createProduct({
      pe_type_business: 1,
      pe_nome_produto: formData.get('name') as string,
      pe_slug: formData.get('slug') as string,
      pe_ref: formData.get('ref') as string,
      pe_modelo: formData.get('model') as string,
    });
    
    if (ProductServiceApi.isOperationSuccessful(response)) {
      const productId = ProductServiceApi.extractRecordId(response);
      revalidatePath('/dashboard/product');
      return { success: true, productId };
    }
    
    return { success: false, error: 'Falha ao criar produto' };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Erro no servidor' };
  }
}
```

## Métodos Utilitários Disponíveis

```typescript
// Extrair dados
ProductServiceApi.extractProductDetail(response);
ProductServiceApi.extractProductList(response);
ProductServiceApi.extractStoredProcedureResponse(response);
ProductServiceApi.extractRecordId(response);

// Validação
ProductServiceApi.isValidProductDetailResponse(response);
ProductServiceApi.isValidProductListResponse(response);
ProductServiceApi.isValidOperationResponse(response);
ProductServiceApi.isOperationSuccessful(response);
```

## Notas Importantes

1. **Type Business**: Sempre especificar `pe_type_business` (1 = B2B, 2 = B2C) para endpoints que requerem
2. **Validação Automática**: Todos os parâmetros são validados com Zod antes de enviar à API
3. **Parâmetros Base**: Os parâmetros de identificação (app_id, system_client_id, etc) são automaticamente incluídos
4. **Tratamento de Erro**: Sempre usar try-catch ao chamar métodos do serviço
5. **Verificação de Sucesso**: Usar métodos `isValid*` e `isOperationSuccessful` para verificar respostas
6. **Extração de Dados**: Usar métodos `extract*` para obter dados das respostas de forma segura
