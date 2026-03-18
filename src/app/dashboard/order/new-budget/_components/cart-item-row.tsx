import { Package } from "lucide-react";
import Image from "next/image";

import type { UIOrderDashboardItem } from "@/services/api-main/order-sales/transformers/transformers";

interface CartItemRowProps {
  item: UIOrderDashboardItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
        {item.imagePath ? (
          <Image
            src={item.imagePath}
            alt={item.product}
            width={40}
            height={40}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <Package className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.product}</p>
        <p className="text-xs text-muted-foreground">
          {item.quantity}x R$ {Number(item.unitValue).toFixed(2)}
        </p>
      </div>

      <span className="shrink-0 text-sm font-semibold">
        R$ {Number(item.totalValue).toFixed(2)}
      </span>
    </div>
  );
}
