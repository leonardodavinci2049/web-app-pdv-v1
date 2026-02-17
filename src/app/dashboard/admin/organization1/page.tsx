import { getOrganizations } from "@/server/organizations";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";
import { CreateOrganizationDialog } from "../_components/create-organization-dialog";
import { OrganizationTable } from "../_components/organization-table";

export default async function OrganizationPage() {
  const organizations = await getOrganizations();

  return (
    <>
      {/* Header fixo no topo */}
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "" },
          { label: "Organizations", isActive: true },
        ]}
      />
      <div className="container mx-auto py-10 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">Manage your organizations.</p>
          </div>
          <CreateOrganizationDialog />
        </div>

        <OrganizationTable organizations={organizations} />
      </div>
    </>
  );
}
