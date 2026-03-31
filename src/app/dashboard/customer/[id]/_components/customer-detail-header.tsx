import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UICustomerDetail } from "@/services/api-main/customer-general/transformers/transformers";

interface CustomerDetailHeaderProps {
  customer: UICustomerDetail;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function CustomerDetailHeader({ customer }: CustomerDetailHeaderProps) {
  const isPessoaFisica = customer.personTypeId === 1;
  const _isPessoaJuridica = customer.personTypeId === 2;

  return (
    <div className="space-y-4 border-b border-border/60 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <Avatar className="h-24 w-24 shrink-0 rounded-2xl ring-4 ring-primary/10">
            <AvatarImage
              src={customer.imagePath || "/avatars/customer.png"}
              alt={customer.name}
            />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                ID #{customer.id}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {customer.name}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {customer.accountType && (
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/30 bg-primary/5 px-3 text-xs font-medium text-primary"
                >
                  {customer.accountType}
                </Badge>
              )}
              {customer.accountStatus && (
                <Badge
                  className={cn(
                    "rounded-full px-3 text-xs font-medium",
                    customer.accountStatus.toUpperCase() === "APROVADA"
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400",
                  )}
                >
                  <BadgeCheck className="mr-1 h-3 w-3" />
                  {customer.accountStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5",
              isPessoaFisica
                ? "border-violet-500/30 bg-violet-500/5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                : "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
            )}
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            {isPessoaFisica ? "Pessoa Física" : "Pessoa Jurídica"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
