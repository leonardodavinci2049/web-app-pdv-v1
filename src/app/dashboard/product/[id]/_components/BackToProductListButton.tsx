"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const PRODUCT_LIST_FALLBACK_ROUTE = "/dashboard/product/product-list";

export function BackToProductListButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(PRODUCT_LIST_FALLBACK_ROUTE);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={handleBack}
    >
      <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
    </Button>
  );
}
