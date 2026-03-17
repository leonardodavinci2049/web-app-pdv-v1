import { OrganizationMetaProvider } from "@/components/common/organization-meta-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getOrganizationConfig } from "@/services/db/organization-meta/organization-meta-helpers";
import { AppSidebar } from "./_components/app-sidebar/app-sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { organizationId, meta, imageBaseUrl } = await getOrganizationConfig();

  return (
    <SidebarProvider>
      <OrganizationMetaProvider
        organizationId={organizationId}
        meta={meta}
        imageBaseUrl={imageBaseUrl}
      >
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </OrganizationMetaProvider>
    </SidebarProvider>
  );
}
