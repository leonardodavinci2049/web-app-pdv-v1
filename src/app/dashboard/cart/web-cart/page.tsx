import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const WebCartPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Carrinho WEB"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Carrinho WEB", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default WebCartPage;
