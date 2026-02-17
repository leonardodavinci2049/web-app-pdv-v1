"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@/db/schema";
import { authClient } from "@/lib/auth/auth-client";

type InviteUsersTableProps = {
  users: User[];
  organizationId: string;
};

export default function InviteUsersTable({
  users,
  organizationId,
}: InviteUsersTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleInviteMember = async (user: User) => {
    try {
      setLoadingId(user.id);
      if (!user.email) {
        setLoadingId(null);
        toast.error("User has no email address");
        return;
      }
      const { error } = await authClient.organization.inviteMember({
        email: user.email,
        role: "customer",
        organizationId,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Invitation sent to member");
      router.refresh();
    } catch (error) {
      toast.error("Failed to invite member to organization");
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback>
                      {user.name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">
                  <Button
                    disabled={loadingId === user.id}
                    onClick={() => handleInviteMember(user)}
                    size="sm"
                    variant="outline"
                  >
                    {loadingId === user.id ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 size-4" />
                    )}
                    Invite
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found to invite.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar>
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback>
                    {user.name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                disabled={loadingId === user.id}
                onClick={() => handleInviteMember(user)}
                size="sm"
                variant="outline"
              >
                {loadingId === user.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                <span className="sr-only">Invite {user.name}</span>
              </Button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            No users found to invite.
          </div>
        )}
      </div>
    </>
  );
}
