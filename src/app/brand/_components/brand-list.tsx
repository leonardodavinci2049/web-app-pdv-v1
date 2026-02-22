import { Package, PackageCheck, PackageX, Tags } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandCreateDialog } from "./brand-create-dialog";
import { BrandRow } from "./brand-row";
import { BrandSearchInput } from "./brand-search-input";

interface BrandListProps {
  brands: UIBrand[];
}

export function BrandList({ brands }: BrandListProps) {
  const totalBrands = brands.length;
  const activeBrands = brands.filter((b) => !b.inactive).length;
  const inactiveBrands = brands.filter((b) => b.inactive).length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Tags className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Marcas
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gerencie as marcas de produtos do seu catálogo
          </p>
        </div>
        <div className="shrink-0">
          <BrandCreateDialog />
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="border bg-card shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-medium text-muted-foreground">
                Total
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {totalBrands}
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate text-xs font-medium text-muted-foreground">
                Ativas
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {activeBrands}
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PackageX className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-medium text-muted-foreground">
                Inativas
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {inactiveBrands}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card de Pesquisa */}
      <Card className="border bg-card shadow-none">
        <CardContent className="flex items-center justify-center p-6">
          <BrandSearchInput />
        </CardContent>
      </Card>

      {/* Tabela de marcas */}
      <Card className="overflow-hidden border shadow-none">
        <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-3">
          <div>
            <p className="text-sm font-semibold">Listagem</p>
            <p className="text-xs text-muted-foreground">
              {totalBrands === 1
                ? "1 marca cadastrada"
                : `${totalBrands} marcas cadastradas`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 hover:bg-muted/10">
                <TableHead className="w-[72px] font-semibold text-foreground/70">
                  ID
                </TableHead>
                <TableHead className="w-[72px] font-semibold text-foreground/70">
                  Imagem
                </TableHead>
                <TableHead className="font-semibold text-foreground/70">
                  Nome
                </TableHead>
                <TableHead className="font-semibold text-foreground/70">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-foreground/70">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Package className="h-7 w-7 opacity-50" />
                      </div>
                      <div>
                        <p className="font-medium">Nenhuma marca cadastrada</p>
                        <p className="mt-0.5 text-sm">
                          Clique em "Nova Marca" para começar.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => <BrandRow key={brand.id} brand={brand} />)
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
