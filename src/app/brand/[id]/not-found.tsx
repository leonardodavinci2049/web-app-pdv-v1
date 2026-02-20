import { PackageX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BrandNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md border shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <PackageX className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Marca não encontrada</CardTitle>
          <CardDescription>
            A marca que você está procurando não existe ou foi removida.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="justify-center">
          <Button asChild variant="outline">
            <Link href="/brand">Voltar para Marcas</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
