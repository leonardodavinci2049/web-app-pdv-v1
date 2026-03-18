import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const CrmPanelPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="CRM"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "CRM", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default CrmPanelPage;
