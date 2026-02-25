"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";

interface UserData {
  name: string;
  email: string;
  avatar: string;
  id?: string;
  role?: string;
}

export function useUserData(): {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
} {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Force refetch session on mount if no session data
  useEffect(() => {
    if (!isPending && !session) {
      refetch();
    }
  }, [isPending, session, refetch]);

  useEffect(() => {
    if (session?.user) {
      // Valid session - set user data
      setUser({
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar:
          session.user.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || "User")}&background=0f172a&color=fff`,
        id: session.user.id,
      });
      setError(null);
    } else if (!isPending && !session) {
      // No session after loading is complete
      // Note: In protected routes, the layout will redirect before this happens
      setUser(null);
      setError("No active session");
    } else if (!isPending && session && !session.user) {
      // Edge case: session exists but no user data
      setUser(null);
      setError("Invalid session data");
      console.error("Session exists but user data is missing");
    }
  }, [session, isPending]);

  return {
    user,
    isLoading: isPending,
    error,
  };
}
