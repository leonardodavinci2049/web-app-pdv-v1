import Link from "next/link";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { getOrganizationBySlug } from "@/server/organizations";
import { getUsers } from "@/server/users";
import InviteUsersTable from "./_components/invite-users-table";
import MembersTable from "./_components/members-table";

type Params = Promise<{ slug: string }>;

export default async function OrganizationPage({ params }: { params: Params }) {
  const { slug } = await params;

  const organization = await getOrganizationBySlug(slug);
  const users = await getUsers(organization?.id || "");

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title={organization.name}
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Organizations", href: "/dashboard/organization" },
          { label: organization.name, isActive: true },
        ]}
      />

      <div className="container mx-auto py-10 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {organization.name}
          </h1>
          <Link href="/dashboard/admin/organization1">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Membros</h2>
            <p className="text-muted-foreground">
              Gerenciar os membros desta organização.
            </p>
          </div>
          <MembersTable members={organization.member || []} />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Convide Usuários
            </h2>
            <p className="text-muted-foreground">
              Convide usuários para se juntarem a esta organização.
            </p>
          </div>
          <InviteUsersTable organizationId={organization.id} users={users} />
        </div>
      </div>
    </>
  );
}
