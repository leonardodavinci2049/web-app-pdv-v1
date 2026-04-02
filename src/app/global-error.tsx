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

export default function GlobalError({
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
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-svh items-center justify-center bg-background px-4 py-8">
          <Card className="w-full max-w-lg rounded-3xl border-border/70 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle>Ocorreu um erro na aplicação</CardTitle>
              <CardDescription>
                Não foi possível concluir esta operação. Tente recarregar a
                página. Se o problema continuar, verifique os serviços do
                ambiente e os logs do servidor.
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
                <Link href="/">
                  <House className="h-4 w-4" />
                  Ir para o início
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}
