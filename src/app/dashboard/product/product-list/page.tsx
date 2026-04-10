import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createLogger } from "@/core/logger";
import {
  ApiConnectionError,
  ApiServerError,
} from "@/lib/axios/base-api-service";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-cached-service";
import { getProductsPdv } from "@/services/api-main/product-pdv/product-pdv-cached-service";
import { getPtypes } from "@/services/api-main/ptype/ptype-cached-service";
import { getTaxonomyMenu } from "@/services/api-main/taxonomy-base/taxonomy-base-cached-service";
import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";
import { type CategoryOption, ProductListContent } from "./_components";

const logger = createLogger("ProductListPage");

function isApiUnavailableError(error: unknown): boolean {
  return error instanceof ApiConnectionError || error instanceof ApiServerError;
}

function buildRetryHref(searchParams: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      query.set(key, value);
    }
  }

  const queryString = query.toString();
  return queryString
    ? `/dashboard/product/product-list?${queryString}`
    : "/dashboard/product/product-list";
}

function ProductListApiUnavailableState({ retryHref }: { retryHref: string }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main mx-auto flex w-full max-w-350 flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <Card className="rounded-3xl border-border/60 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <CardTitle>Serviço de produtos indisponível</CardTitle>
            <CardDescription>
              Não foi possível consultar a API de produtos no momento. Isso
              normalmente acontece quando o serviço externo está fora do ar ou
              com instabilidade temporária.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Tente recarregar esta página em alguns instantes. Se a falha
              continuar, valide a conexão com a API RESTCLEA e as credenciais de
              integração do ambiente.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="w-full gap-2 sm:w-auto"
            >
              <Link href={retryHref}>
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Link>
            </Button>

            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard">Voltar ao dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

interface ProductListPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    type?: string;
    stock?: string;
    sort?: string;
    limit?: string;
    page?: string;
  }>;
}

function mapSortToApiParams(sortBy?: string): {
  columnId: number;
  orderId: number;
} {
  switch (sortBy) {
    case "name-asc":
      return { columnId: 1, orderId: 1 };
    case "name-desc":
      return { columnId: 1, orderId: 2 };
    case "newest":
      return { columnId: 2, orderId: 2 };
    case "price-asc":
      return { columnId: 3, orderId: 1 };
    case "price-desc":
      return { columnId: 3, orderId: 2 };
    default:
      return { columnId: 2, orderId: 2 };
  }
}

function flattenMenuItems(
  items: UITaxonomyMenuItem[],
  allItems: UITaxonomyMenuItem[],
  level: number = 1,
): CategoryOption[] {
  const result: CategoryOption[] = [];
  for (const item of items) {
    let displayName = item.name;
    if (level === 2) displayName = `- ${item.name}`;
    else if (level === 3) displayName = `-- ${item.name}`;

    result.push({
      id: item.id,
      name: item.name,
      level,
      displayName,
    });

    const children = allItems.filter((child) => child.parentId === item.id);
    if (children.length > 0) {
      result.push(...flattenMenuItems(children, allItems, level + 1));
    }
  }
  return result;
}

async function getCategories(
  apiContext: Record<string, unknown>,
): Promise<CategoryOption[]> {
  try {
    const menuItems = await getTaxonomyMenu(2, 0, apiContext);
    const rootItems = menuItems.filter((item) => item.parentId === 0);
    return flattenMenuItems(rootItems, menuItems);
  } catch (error) {
    logger.error("Erro ao buscar categorias:", error);
    return [];
  }
}

export default async function ProductListPage(props: ProductListPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const sort = mapSortToApiParams(searchParams.sort);
  const limit = Number(searchParams.limit) || 20;

  type ProductListPageData = {
    products: Awaited<ReturnType<typeof getProductsPdv>>;
    brands: Awaited<ReturnType<typeof getBrands>>;
    categories: Awaited<ReturnType<typeof getCategories>>;
    ptypes: Awaited<ReturnType<typeof getPtypes>>;
  };

  let pageData: ProductListPageData;

  try {
    const [products, brands, categories, ptypes] = await Promise.all([
      getProductsPdv({
        search: searchParams.search,
        taxonomyId: searchParams.category
          ? Number(searchParams.category)
          : undefined,
        brandId: searchParams.brand ? Number(searchParams.brand) : undefined,
        typeId: searchParams.type ? Number(searchParams.type) : undefined,
        flagStock: searchParams.stock === "1" ? 1 : undefined,
        recordsQuantity: limit,
        pageId: Number(searchParams.page) || 0,
        columnId: sort.columnId,
        orderId: sort.orderId,
        ...apiContext,
      }),
      getBrands({ limit: 100, ...apiContext }),
      getCategories(apiContext),
      getPtypes({ limit: 100, ...apiContext }),
    ]);

    pageData = { products, brands, categories, ptypes };
  } catch (error) {
    if (isApiUnavailableError(error)) {
      logger.warn("API indisponível ao carregar lista de produtos", error);

      return (
        <>
          <SiteHeaderWithBreadcrumb
            title="Lista de Produtos"
            breadcrumbItems={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Produtos", href: "#" },
              { label: "Lista", isActive: true },
            ]}
          />

          <ProductListApiUnavailableState
            retryHref={buildRetryHref({
              search: searchParams.search,
              category: searchParams.category,
              brand: searchParams.brand,
              type: searchParams.type,
              stock: searchParams.stock,
              sort: searchParams.sort,
              limit: searchParams.limit,
              page: searchParams.page,
            })}
          />
        </>
      );
    }

    throw error;
  }

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Lista de Produtos"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produtos", href: "#" },
          { label: "Lista", isActive: true },
        ]}
      />

      <div className="flex flex-1 flex-col">
        <div className="@container/main mx-auto w-full max-w-350 flex-1 flex-col gap-6 px-4 lg:px-6 py-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:rounded-[28px] sm:p-5">
              <div>
                <h1 className="text-2xl font-bold">Lista de Produtos</h1>
              </div>

              <ProductListContent
                products={pageData.products}
                brands={pageData.brands}
                categories={pageData.categories}
                ptypes={pageData.ptypes}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
