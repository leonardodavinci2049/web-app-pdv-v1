"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BrandDetail as IBrandDetail } from "@/services/api-main/brand";
import { BrandDeleteDialog } from "../../_components/brand-delete-dialog";
import { BrandUpdateDialog } from "../../_components/brand-update-dialog";

interface BrandDetailProps {
  brand: IBrandDetail;
}

export function BrandDetail({ brand }: BrandDetailProps) {
  const brandName = brand.MARCA ?? brand.NOME ?? "Sem Nome";
  const isActive = brand.INATIVO === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/brand">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{brandName}</h2>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <BrandUpdateDialog brandId={brand.ID_MARCA} brandName={brandName} />
          <BrandDeleteDialog
            brandId={brand.ID_MARCA}
            brandName={brandName}
            redirectTo="/brand"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  ID da Marca
                </span>
                <p>{brand.ID_MARCA}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  UUID
                </span>
                <p className="truncate" title={brand.UUID ?? ""}>
                  {brand.UUID ?? "-"}
                </p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Nome
              </span>
              <p>{brandName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Data de Cadastro
              </span>
              <p>
                {brand.DATADOCADASTRO
                  ? new Date(brand.DATADOCADASTRO).toLocaleString("pt-BR")
                  : "-"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Última Atualização
              </span>
              <p>
                {brand.DT_UPDATE
                  ? new Date(brand.DT_UPDATE).toLocaleString("pt-BR")
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
