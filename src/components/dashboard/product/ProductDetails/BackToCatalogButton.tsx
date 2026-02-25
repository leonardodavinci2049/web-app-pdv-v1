"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * BackToCatalogButton Component (Client Component)
 *
 * Navigates back to the product catalog while preserving filter state.
 * The catalog page uses sessionStorage to restore the previous filter state,
 * including search terms, selected categories, and sorting options.
 *
 * This provides a better user experience as users don't lose their search
 * context when navigating between product details and catalog.
 */
export function BackToCatalogButton() {
  const router = useRouter();

  const handleBackToCatalog = () => {
    // Navigate to catalog - filters will be restored from sessionStorage
    router.push("/dashboard/product/catalog");
  };

  return (
    <Button variant="outline" onClick={handleBackToCatalog}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Voltar ao Catálogo
    </Button>
  );
}
