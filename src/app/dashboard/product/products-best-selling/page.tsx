import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const ProductsBestSellingPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Produtos Mais Vendidos", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default ProductsBestSellingPage;
