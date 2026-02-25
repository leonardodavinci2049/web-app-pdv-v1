"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

export function useAuth() {
  const router = useRouter();

  const logout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Sessão encerrada com sucesso");
            router.push("/sign-in");
          },
          onError: (ctx) => {
            console.error("Erro ao fazer logout:", ctx.error);
            toast.error("Erro ao encerrar sessão");
          },
        },
      });
    } catch (error) {
      console.error("Erro inesperado no logout:", error);
      toast.error("Erro inesperado ao encerrar sessão");
    }
  };

  return { logout };
}
