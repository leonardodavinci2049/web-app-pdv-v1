import { Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProductListEmptyStateProps {
  hasSearch: boolean;
}

export function ProductListEmptyState({
  hasSearch,
}: ProductListEmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center rounded-3xl border-dashed border-border/70 bg-muted/10 py-16 dark:bg-muted/5">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        {hasSearch ? (
          <Search className="h-10 w-10 text-primary" />
        ) : (
          <Package className="h-10 w-10 text-primary" />
        )}
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">
        {hasSearch ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
      </h3>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        {hasSearch
          ? "Não encontramos produtos para os filtros aplicados. Tente ajustar os filtros ou o termo de busca."
          : "Não há produtos cadastrados ainda. Comece adicionando produtos ao catálogo."}
      </p>
      <div className="mt-6 flex gap-3">
        {hasSearch && (
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="rounded-full"
          >
            Voltar
          </Button>
        )}
      </div>
    </Card>
  );
}
