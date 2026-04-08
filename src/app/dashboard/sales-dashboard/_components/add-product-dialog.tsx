"use client";

import { Loader2, Package, Plus, Search } from "lucide-react";
import Image from "next/image";
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";
import { addItemAction } from "../actions/add-item-action";
import { searchProductsAction } from "../actions/search-products-action";

const EDITABLE_ORDER_STATUS_ID = 22;

interface AddProductDialogProps {
  orderId: number;
  customerId: number;
  sellerId: number;
  paymentFormId: number;
  orderStatusId: number;
  children: React.ReactNode;
}

export function AddProductDialog({
  orderId,
  customerId,
  sellerId,
  paymentFormId,
  orderStatusId,
  children,
}: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<UIProductPdv[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, startAddTransition] = useTransition();
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditable = orderStatusId === EDITABLE_ORDER_STATUS_ID;

  const doSearch = useCallback(async (term: string) => {
    setIsSearching(true);
    try {
      const results = await searchProductsAction(term);
      setProducts(results);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    doSearch("");
  }, [open, doSearch]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(value);
    }, 400);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && !isEditable) {
      toast.warning("Ação não permitida", {
        description:
          "Somente pedidos com status de orçamento permitem adicionar novos produtos.",
      });
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setProducts([]);
    }
  }

  function handleAddProduct(product: UIProductPdv) {
    setAddingProductId(product.id);
    startAddTransition(async () => {
      const result = await addItemAction({
        orderId,
        productId: product.id,
        customerId,
        sellerId,
        paymentFormId,
        quantity: 1,
      });

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
      setAddingProductId(null);
    });
  }

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ onClick?: () => void }>, {
        onClick: () => handleOpenChange(true),
      })
    : children;

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-[20px] p-0 sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader className="space-y-4 border-b border-border/60 px-5 pt-5 pb-4">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Buscar Produto
            </DialogTitle>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Buscar por nome, referência, modelo, etiqueta..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={
                  isSearching ? "rounded-xl pl-9 opacity-60" : "rounded-xl pl-9"
                }
              />
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="flex flex-col divide-y divide-border/50 px-2 py-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {search
                      ? "Nenhum produto encontrado"
                      : "Busque por nome, código ou categoria"}
                  </p>
                </div>
              ) : (
                products.map((product) => (
                  <ProductSearchItem
                    key={product.id}
                    product={product}
                    onAdd={handleAddProduct}
                    isAdding={isAdding && addingProductId === product.id}
                    disabled={isAdding}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ProductSearchItemProps {
  product: UIProductPdv;
  onAdd: (product: UIProductPdv) => void;
  isAdding: boolean;
  disabled: boolean;
}

function ProductSearchItem({
  product,
  onAdd,
  isAdding,
  disabled,
}: ProductSearchItemProps) {
  const price = product.productValue
    ? Number(product.productValue)
    : Number(product.retailPrice);

  return (
    <div className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/50 md:h-20 md:w-20">
        {product.imagePath ? (
          <Image
            src={product.imagePath}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/50 text-[10px] text-muted-foreground">
            Sem imagem
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div>
          <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
            {product.name}
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            SKU {product.sku || "N/A"}
            {product.shortDescription ? ` • ${product.shortDescription}` : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-foreground">
            {formatCurrency(price)}
          </span>

          <Badge
            variant="outline"
            className="rounded-full px-2 py-0 text-[10px]"
          >
            Estoque: {product.storeStock}
          </Badge>

          {product.promotion && (
            <Badge className="rounded-full bg-accent px-2 py-0 text-[10px] text-accent-foreground hover:bg-accent">
              Oferta
            </Badge>
          )}
        </div>
      </div>

      <Button
        size="sm"
        className="shrink-0 rounded-full px-3"
        disabled={disabled || product.storeStock <= 0}
        onClick={() => onAdd(product)}
      >
        {isAdding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </>
        )}
      </Button>
    </div>
  );
}
