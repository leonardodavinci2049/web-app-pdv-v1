import { BrandServiceApi } from "@/services/api-main/brand/brand-service-api";

const BrandPage = async () => {
  const response = await BrandServiceApi.findAllBrands({
    pe_organization_id: "1",
    pe_user_id: "1",
    pe_member_role: "admin",
    pe_person_id: 1,
  });
  const brands = BrandServiceApi.extractBrandList(response);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Marcas</h1>
      <div className="grid gap-2">
        {brands.length === 0 ? (
          <p className="text-gray-500">Nenhuma marca encontrada</p>
        ) : (
          brands.map((brand) => (
            <div
              key={brand.ID_MARCA}
              className="p-4 border rounded-lg bg-white"
            >
              <div className="font-medium">ID: {brand.ID_MARCA}</div>
              <div className="text-gray-700">{brand.MARCA ?? "Sem nome"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrandPage;
