"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export default function PageAdminUsers() {
  const [hasAdminPermission, setHasAdminPermission] = useState(false);
  const {
    data: session,
    isPending: loading,
    refetch,
  } = authClient.useSession();

  useEffect(() => {
    const checkPermission = async () => {
      // Primeiro, faz refresh da sessão para carregar dados atualizados do banco
      await refetch();

      const response = await authClient.admin.hasPermission({
        permission: { user: ["list"] },
      });
      setHasAdminPermission(response.data?.success ?? false);
    };

    checkPermission();
  }, [refetch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-6 px-4 max-w-md mx-auto">
      <div className="text-center space-y-6">
        {session == null ? (
          <>
            <h1 className="text-3xl font-bold">Welcome to Our App</h1>
            <Button asChild size="lg">
              <Link href="/">Sign In / Sign Up</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Welcome {session.user.name}!</h1>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/dashboard/admin">Dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard/admin/organization2">Organizações</Link>
              </Button>
              {hasAdminPermission && (
                <Button variant="outline" asChild size="lg">
                  <Link href="/admin">Panel Admin</Link>
                </Button>
              )}
              <BetterAuthActionButton
                size="lg"
                variant="destructive"
                action={() => authClient.signOut()}
              >
                Sign Out
              </BetterAuthActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
