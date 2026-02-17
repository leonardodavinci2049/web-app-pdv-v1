import { Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentMethods } from "./payment-methods";

export function OrderSummary() {
  return (
    <Card className="h-auto md:h-full p-6 bg-card border-border flex flex-col shrink-0">
      <h2 className="text-xl font-semibold mb-6 text-foreground">
        Resumo do Pedido
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">R$ 0,00</span>
        </div>

        <div className="flex justify-between text-sm items-center">
          <span className="text-muted-foreground">Desconto:</span>
          <div className="flex items-center gap-1">
            <span className="font-medium">- R$ 0,00</span>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="border-t border-border pt-3 flex justify-between">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-semibold">R$ 0,00</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-foreground">
          Formas de Pagamento
        </h3>
        <PaymentMethods />
      </div>

      <div className="md:mt-auto space-y-3">
        <Button variant="secondary" className="w-full" size="lg">
          Salvar Orçamento
        </Button>
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          Finalizar Venda
        </Button>
      </div>
    </Card>
  );
}
