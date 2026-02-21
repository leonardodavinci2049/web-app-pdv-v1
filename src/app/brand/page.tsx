import { connection } from "next/server";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-cached-service";
import { BrandList } from "./_components/brand-list";

export default async function BrandPage() {
  await connection();
  const { apiContext } = await getAuthContext();

  const brands = await getBrands({
    limit: 100,
    ...apiContext,
  });

  return <BrandList brands={brands} />;
}
