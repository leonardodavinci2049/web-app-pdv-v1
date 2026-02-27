"use client";

import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

export function useAuth() {
  const logout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Sessão encerrada com sucesso");
            // Navegação hard para limpar todo estado React e evitar refetch loops
            window.location.href = "/sign-in";
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
