import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function OrderItemsSection() {
  return (
    <Card className="flex-1 p-4 bg-card border-border flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Itens do Pedido</h3>
        <Button variant="secondary" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Nenhum item no carrinho.
        </p>
      </div>
    </Card>
  );
}
