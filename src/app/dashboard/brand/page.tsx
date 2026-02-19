import { getBrands } from "@/services/api-main/brand/brand-cached-service";

const BrandPage = async () => {
  // Dados de sessão fictícios (ajuste conforme necessário)
  const brands = await getBrands({
    brandId: 0,
    brand: "",
    limit: 10,
    pe_organization_id: "1",
    pe_user_id: "1",
    pe_member_role: "admin",
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
