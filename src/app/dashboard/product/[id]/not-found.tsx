import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <h2 className="text-2xl font-bold">Produto não encontrado</h2>
      <p className="text-muted-foreground">
        O produto que você está procurando não existe ou foi removido.
      </p>
      <Button asChild>
        <Link href="/dashboard/product/catalog">Voltar ao Catálogo</Link>
      </Button>
    </div>
  );
}
