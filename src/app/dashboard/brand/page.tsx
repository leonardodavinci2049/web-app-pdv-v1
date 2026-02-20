import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getBrands } from "@/services/api-main/brand/brand-cached-service";

const BrandPage = async () => {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const brands = await getBrands({
    limit: 10,
    pe_system_client_id: session.session?.systemId ?? 0,
    pe_organization_id: session.session?.activeOrganizationId ?? "0",
    pe_user_id: session.user.id ?? "0",
    pe_member_role: session.user.role ?? "admin",
    pe_person_id: 1,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Marcas</h1>
      <div className="grid gap-2">
        {brands.length === 0 ? (
          <p className="text-gray-500">Nenhuma marca encontrada</p>
        ) : (
          brands.map((brand) => (
            <div key={brand.id} className="p-4 border rounded-lg bg-white">
              <div className="font-medium">ID: {brand.id}</div>
              <div className="text-gray-700">{brand.name ?? "Sem nome"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrandPage;
