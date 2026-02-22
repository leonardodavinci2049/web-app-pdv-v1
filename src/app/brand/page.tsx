import { connection } from "next/server";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-cached-service";
import { BrandList } from "./_components/brand-list";

interface BrandPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function BrandPage(props: BrandPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const brands = await getBrands({
    limit: 100,
    search: searchParams.search,
    ...apiContext,
  });

  return <BrandList brands={brands} />;
}
