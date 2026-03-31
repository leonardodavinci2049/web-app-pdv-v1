import { Search, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CustomerListEmptyStateProps {
  hasSearch: boolean;
}

export function CustomerListEmptyState({
  hasSearch,
}: CustomerListEmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center rounded-3xl border-dashed border-border/70 bg-muted/10 py-16 dark:bg-muted/5">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        {hasSearch ? (
          <Search className="h-10 w-10 text-primary" />
        ) : (
          <Users className="h-10 w-10 text-primary" />
        )}
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">
        {hasSearch ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
      </h3>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        {hasSearch
          ? "Não encontramos clientes para o termo de busca informado. Tente outro termo ou cadastre um novo cliente."
          : "Não há clientes cadastrados ainda. Comece adicionando um novo cliente ao sistema."}
      </p>
      <div className="mt-6 flex gap-3">
        {!hasSearch && (
          <Button asChild variant="default" className="rounded-full">
            <Link href="/dashboard/customer/add-customer">
              Adicionar Primeiro Cliente
            </Link>
          </Button>
        )}
        {hasSearch && (
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="rounded-full"
          >
            Limpar Busca
          </Button>
        )}
      </div>
    </Card>
  );
}
