import { Search, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { UIOrderCustomer } from "@/services/api-main/order-sales/transformers/transformers";

interface CustomerSectionProps {
  customer: UIOrderCustomer | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getDocumentLabel(customer: UIOrderCustomer): string | null {
  if (customer.cnpj) return customer.cnpj;
  if (customer.cpf) return customer.cpf;
  return null;
}

export function CustomerSection({ customer }: CustomerSectionProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Cliente</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {customer ? (
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-muted text-muted-foreground text-lg">
              {getInitials(customer.customerName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              {customer.customerName}
            </span>
            {(customer.phone || customer.whatsapp) && (
              <span className="text-xs text-muted-foreground">
                {customer.phone || customer.whatsapp}
              </span>
            )}
            {getDocumentLabel(customer) && (
              <span className="text-xs text-muted-foreground">
                {getDocumentLabel(customer)}
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum cliente selecionado
        </p>
      )}
    </Card>
  );
}
