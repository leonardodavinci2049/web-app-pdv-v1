"use client";

import { AlertTriangle, House, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-8 lg:px-6">
      <Card className="w-full max-w-lg rounded-3xl border-border/70 shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle>Não foi possível carregar esta página</CardTitle>
          <CardDescription>
            Ocorreu uma falha ao abrir este conteúdo do dashboard. Tente
            novamente em instantes. Se o problema persistir, verifique a
            disponibilidade da API e dos serviços internos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error.digest && (
            <p className="text-center font-mono text-xs text-muted-foreground">
              Código de referência: {error.digest}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            onClick={reset}
            variant="outline"
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>

          <Button asChild className="w-full gap-2 sm:w-auto">
            <Link href="/dashboard">
              <House className="h-4 w-4" />
              Voltar ao dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
