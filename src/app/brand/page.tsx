import type { Metadata } from "next";
import { connection } from "next/server";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-cached-service";
import { BrandList } from "./_components/brand-list";

export const metadata: Metadata = {
  title: "Marcas | Dashboard",
  description: "Gerenciamento de marcas do sistema",
};

export default async function BrandPage() {
  await connection();
  const { apiContext } = await getAuthContext();

  const brands = await getBrands({
    limit: 100,
    ...apiContext,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <BrandList brands={brands} />
      </div>
    </div>
  );
}
