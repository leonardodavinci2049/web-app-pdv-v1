import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getBrands } from "@/services/api-main/brand/brand-cached-service";
import { BrandList } from "./_components/brand-list";

export const metadata: Metadata = {
  title: "Marcas | Dashboard",
  description: "Gerenciamento de marcas do sistema",
};

export default async function BrandPage() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  // Debug: Log session data to understand what's being passed
  /*   console.log("BrandPage Session Data:", {
    organizationId: session.session?.activeOrganizationId,
    userId: session.user.id,
    role: session.user.role,
  }); */

  // Buscar marcas usando o serviço com cache (consistente com dashboard)
  const brands = await getBrands({
    limit: 100,
    pe_system_client_id: session.session?.systemId ?? 0,
    pe_organization_id: session.session?.activeOrganizationId ?? "0",
    pe_user_id: session.user.id ?? "0",
    pe_member_role: session.user.role ?? "admin",
    pe_person_id: 1,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <BrandList brands={brands} />
      </div>
    </div>
  );
}
