import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const AgendaPanelPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Agenda"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Agenda", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default AgendaPanelPage;
