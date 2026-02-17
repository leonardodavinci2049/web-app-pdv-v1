import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Organization } from "@/db/schema";
import { OrganizationActions } from "./organization-actions";

interface OrganizationTableProps {
  organizations: Organization[];
}

export function OrganizationTable({ organizations }: OrganizationTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="w-20">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={org.logo || ""} alt={org.name} />
                    <AvatarFallback>
                      {org.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/admin/organization1/${org.slug}`}
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {org.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{org.slug}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {org.id}
                </TableCell>
                <TableCell>
                  {org.createdAt
                    ? new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(org.createdAt))
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <OrganizationActions organization={org} />
                </TableCell>
              </TableRow>
            ))}
            {organizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No organizations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {organizations.map((org) => (
          <div key={org.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar>
                  <AvatarImage src={org.logo || ""} alt={org.name} />
                  <AvatarFallback>
                    {org.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/admin/organization1/${org.slug}`}
                    className="font-medium hover:underline text-blue-600 dark:text-blue-400 block truncate"
                  >
                    {org.name}
                  </Link>
                  <Badge variant="outline" className="mt-1">
                    {org.slug}
                  </Badge>
                </div>
              </div>
              <OrganizationActions organization={org} />
            </div>
            <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
              <p className="font-mono text-xs truncate">ID: {org.id}</p>
              {org.createdAt && (
                <p className="text-xs">
                  Created{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                  }).format(new Date(org.createdAt))}
                </p>
              )}
            </div>
          </div>
        ))}
        {organizations.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            No organizations found.
          </div>
        )}
      </div>
    </>
  );
}
