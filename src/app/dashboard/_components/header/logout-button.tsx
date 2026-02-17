"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully");
            window.location.href = "/sign-in";
          },
        },
      });
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Logout</span>
    </Button>
  );
}
