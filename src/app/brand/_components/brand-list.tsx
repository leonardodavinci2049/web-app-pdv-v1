"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface BrandListProps {
  brands: UIBrand[];
}

export function BrandList({ brands }: BrandListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Listagem de Marcas</CardTitle>
        <BrandCreateDialog />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhuma marca encontrada.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => <BrandRow key={brand.id} brand={brand} />)
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
