"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/auth-client";
import { LoadingButton } from "./loading-button";

export function LogoutEverywhereButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogoutEverywhere() {
    setLoading(true);

    try {
      // Sign out and clear session
      const { error } = await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear any client-side cached data
            router.refresh();
          },
        },
      });

      if (error) {
        toast.error(error.message || "Failed to log out");
        setLoading(false);
        return;
      }

      toast.success("Logged out successfully");
      // Redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
      setLoading(false);
    }
  }

  return (
    <LoadingButton
      variant="ghost"
      size="sm"
      onClick={handleLogoutEverywhere}
      loading={loading}
      className="gap-2"
      aria-label="Log out from all devices"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Log out</span>
    </LoadingButton>
  );
}
