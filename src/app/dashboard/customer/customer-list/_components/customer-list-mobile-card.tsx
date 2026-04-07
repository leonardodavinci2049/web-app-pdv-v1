"use client";

import { Eye, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UICustomerListItem } from "@/services/api-main/customer-general/transformers/transformers";

import { CustomerQuickViewDialog } from "./customer-quick-view-dialog";

interface CustomerListMobileCardProps {
  customer: UICustomerListItem;
  editHref: string;
}

export function CustomerListMobileCard({
  customer,
  editHref,
}: CustomerListMobileCardProps) {
  const validImage =
    customer.imagePath &&
    (customer.imagePath.startsWith("/") ||
      customer.imagePath.startsWith("http"))
      ? customer.imagePath
      : undefined;
  const [imgSrc, setImgSrc] = useState(validImage || "/avatars/customer.png");

  return (
    <Card className="group gap-0 overflow-hidden rounded-xl border-border/60 bg-neutral-100 py-0 shadow-sm transition-all hover:bg-neutral-200/80 hover:shadow-md dark:bg-neutral-700/60 dark:hover:bg-neutral-600/60">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-full bg-primary/8 p-0.5">
            <Image
              src={imgSrc}
              alt={customer.name}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border border-primary/10 object-cover"
              onError={() => setImgSrc("/avatars/customer.png")}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start gap-1.5">
              <p className="min-w-0 whitespace-normal wrap-break-word text-sm font-semibold leading-5 text-foreground">
                {customer.name}
              </p>
            </div>

            <div className="mt-0.5 flex items-center gap-x-2 overflow-hidden text-xs text-muted-foreground">
              <span className="shrink-0 text-[10px] font-medium text-muted-foreground/70">
                #{customer.customerId}
              </span>
              {customer.customerType && (
                <span className="min-w-0 truncate">
                  {customer.customerType}
                </span>
              )}

              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 text-xs",
                  customer.personTypeId === 1
                    ? "border-violet-500/30 bg-violet-500/5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                    : "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                )}
              >
                {customer.personType}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/40 pt-3">
          <CustomerQuickViewDialog
            customer={customer}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full border border-border/40 bg-background text-muted-foreground shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                title="Visualização rápida"
              >
                <Eye className="h-4 w-4" />
              </Button>
            }
          />

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full border border-border/40 bg-background text-muted-foreground shadow-sm hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400"
            title="Editar cliente"
          >
            <Link href={editHref}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
