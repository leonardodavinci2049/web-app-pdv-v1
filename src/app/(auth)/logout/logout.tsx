"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Logout <LogOut className="size-4" />
    </Button>
  );
}
