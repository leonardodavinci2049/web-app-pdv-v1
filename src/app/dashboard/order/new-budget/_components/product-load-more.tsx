"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";

interface ProductLoadMoreProps {
  currentLimit: number;
  totalLoaded: number;
}

export function ProductLoadMore({
  currentLimit,
  totalLoaded,
}: ProductLoadMoreProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(currentLimit + 20));

    startTransition(() => {
      router.push(`/dashboard/order/new-budget?${params.toString()}`, {
        scroll: false,
      });
    });
  }, [searchParams, currentLimit, router]);

  if (totalLoaded < currentLimit) return null;

  return (
    <div className="flex justify-center rounded-3xl border border-dashed border-border/60 bg-card/50 py-5">
      <Button
        variant="default"
        size="lg"
        className="rounded-full px-8"
        onClick={handleLoadMore}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Carregando...
          </>
        ) : (
          "Carregar Mais Produtos"
        )}
      </Button>
    </div>
  );
}
