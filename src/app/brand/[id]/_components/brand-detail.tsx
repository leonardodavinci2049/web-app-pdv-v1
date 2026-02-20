import { ArrowLeft, Calendar, Hash, Tags } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandDeleteDialog } from "../../_components/brand-delete-dialog";
import { BrandUpdateDialog } from "../../_components/brand-update-dialog";

interface BrandDetailProps {
  brand: UIBrand;
}

export function BrandDetail({ brand }: BrandDetailProps) {
  const brandName = brand.name || "Sem Nome";
  const isActive = !brand.inactive;
  const initial = brandName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Botão voltar */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 gap-2 text-muted-foreground hover:text-foreground"
            >
              <Link href="/brand">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Marcas
              </Link>
            </Button>
          </div>

          {/* Hero section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                {initial}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {brandName}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    ID #{brand.id}
                  </span>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={
                      isActive
                        ? "bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                        : "text-xs"
                    }
                  >
                    {isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <BrandUpdateDialog brandId={brand.id} brandName={brandName} />
              <BrandDeleteDialog
                brandId={brand.id}
                brandName={brandName}
                redirectTo="/brand"
              />
            </div>
          </div>

          {/* Cards de informação */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  Identificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      ID
                    </p>
                    <p className="mt-0.5 font-mono font-semibold">{brand.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Status
                    </p>
                    <p className="mt-0.5 font-medium">
                      {isActive ? "Ativa" : "Inativa"}
                    </p>
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Nome
                  </p>
                  <p className="mt-0.5 font-medium">{brandName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Tags className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Marca registrada no sistema
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Cadastrado em
                  </p>
                  <p className="mt-0.5 font-medium">
                    {brand.createdAt
                      ? new Date(brand.createdAt).toLocaleString("pt-BR")
                      : "—"}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Última atualização
                  </p>
                  <p className="mt-0.5 font-medium">
                    {brand.updatedAt
                      ? new Date(brand.updatedAt).toLocaleString("pt-BR")
                      : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
