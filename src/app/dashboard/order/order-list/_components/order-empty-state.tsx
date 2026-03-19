import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderEmptyStateProps {
  onClearFilters?: () => void;
}

export function OrderEmptyState({ onClearFilters }: OrderEmptyStateProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
      <div className="mb-4 rounded-full border border-border/70 bg-background p-4 shadow-sm">
        <SearchX className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight">
        Nenhum pedido encontrado
      </h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Tente ajustar os filtros para localizar vendas com outro vendedor,
        status ou período.
      </p>
      {onClearFilters && (
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={onClearFilters}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
