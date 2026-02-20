import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/auth";
import { brandServiceApi } from "@/services/api-main/brand";
import { BrandDetail } from "./_components/brand-detail";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const brandId = Number(id);
  if (Number.isNaN(brandId)) {
    notFound();
  }

  const response = await brandServiceApi.findBrandById({
    pe_brand_id: brandId,
    pe_system_client_id: session.session?.systemId ?? 0,
    pe_organization_id: session.session?.activeOrganizationId ?? "1",
    pe_user_id: session.user.id ?? "1",
    pe_member_role: session.user.role ?? "admin",
    pe_person_id: 1,
  });
  const brand = brandServiceApi.extractBrandById(response);

  if (!brand) {
    notFound();
  }

  return <BrandDetail brand={brand} />;
}
