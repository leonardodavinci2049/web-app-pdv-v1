import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getAuthContext } from "@/server/auth-context";
import { getBrandById } from "@/services/api-main/brand/brand-cached-service";
import { BrandDetail } from "./_components/brand-detail";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { apiContext } = await getAuthContext();

  const { id } = await params;
  const brandId = Number(id);
  if (Number.isNaN(brandId)) {
    notFound();
  }

  const brand = await getBrandById(brandId, apiContext);

  if (!brand) {
    notFound();
  }

  return <BrandDetail brand={brand} />;
}
