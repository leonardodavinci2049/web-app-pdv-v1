import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { getAuthContext } from "@/server/auth-context";
import { getProductsPdv } from "@/services/api-main/product-pdv/product-pdv-cached-service";
import { ProductCatalogContent } from "./components/ProductCatalogContent";

interface CatalogoPageProps {
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

export default async function CatalogoPage(props: CatalogoPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const sort = mapSortToApiParams(searchParams.sort);
  const limit = Number(searchParams.limit) || 20;

  const products = await getProductsPdv({
    search: searchParams.search,
    taxonomyId: searchParams.category
      ? Number(searchParams.category)
      : undefined,
    brandId: searchParams.brand ? Number(searchParams.brand) : undefined,
    typeId: searchParams.type ? Number(searchParams.type) : undefined,
    flagStock: searchParams.stock === "1" ? 1 : undefined,
    recordsQuantity: limit,
    pageId: Number(searchParams.page) || 1,
    columnId: sort.columnId,
    orderId: sort.orderId,
    ...apiContext,
  });

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Catálogo"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produtos", href: "#" },
          { label: "Catálogo", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
                  <p className="text-muted-foreground mt-2">
                    Gerencie e visualize todos os produtos do seu catálogo com
                    filtros avançados.
                  </p>
                </div>

                <ProductCatalogContent products={products} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
