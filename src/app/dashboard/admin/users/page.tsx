import { Users } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth/auth";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";
import { UserRow } from "./_components/user-row";

export default async function AdminPage() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });

  if (session == null) return redirect("/auth/login");
  const hasAccess = await auth.api.userHasPermission({
    headers: await headers(),
    body: { permission: { user: ["list"] } },
  });
  if (!hasAccess.success) return redirect("/");

  const users = await auth.api.listUsers({
    headers: await headers(),
    query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
  });

  return (
    <div className="mx-auto container my-6 px-4">
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Usuários", isActive: true },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({users.total})
          </CardTitle>
          <CardDescription>
            Gerenciar contas de usuário, funções e permissões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-25">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.users.map((user) => (
                  <UserRow key={user.id} user={user} selfId={session.user.id} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
