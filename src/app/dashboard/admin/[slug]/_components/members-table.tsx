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
import type { Member } from "@/db/schema";
import { MembersActions } from "./members-actions";

type MembersTableProps = {
  members: Member[];
};

export default function MembersTable({ members }: MembersTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="w-20">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage
                      src={member.user.image || ""}
                      alt={member.user.name || ""}
                    />
                    <AvatarFallback>
                      {member.user.name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {member.user.name}
                </TableCell>
                <TableCell>{member.user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{member.role}</Badge>
                </TableCell>
                <TableCell>
                  {member.createdAt
                    ? new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(member.createdAt))
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <MembersActions member={member} />
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar>
                  <AvatarImage
                    src={member.user.image || ""}
                    alt={member.user.name || ""}
                  />
                  <AvatarFallback>
                    {member.user.name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{member.user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {member.user.email}
                  </p>
                </div>
              </div>
              <MembersActions member={member} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary">{member.role}</Badge>
              {member.createdAt && (
                <span className="text-xs text-muted-foreground">
                  Joined{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                  }).format(new Date(member.createdAt))}
                </span>
              )}
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            No members found.
          </div>
        )}
      </div>
    </>
  );
}
