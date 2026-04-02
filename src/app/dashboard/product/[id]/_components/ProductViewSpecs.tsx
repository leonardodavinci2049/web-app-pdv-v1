import { CheckSquare, Receipt, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";

interface ProductViewSpecsProps {
  product: UIProductPdv;
}

export function ProductViewSpecs({ product }: ProductViewSpecsProps) {
  const hasGeneralData = product.label || product.ref || product.model;
  const hasPhysicalData =
    product.warrantyDays ||
    product.weightGr ||
    product.lengthMm ||
    product.widthMm ||
    product.heightMm ||
    product.diameterMm;
  const hasTaxData =
    product.cfop ||
    product.cst ||
    product.ean ||
    product.ncm ||
    product.nbm ||
    product.ppb ||
    product.temp;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Dados Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            {product.label && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">Rótulo:</dt>
                <dd className="font-medium text-right">{product.label}</dd>
              </div>
            )}
            {product.ref && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">Referência:</dt>
                <dd className="font-medium text-right">{product.ref}</dd>
              </div>
            )}
            {product.model && (
              <div className="grid grid-cols-2 gap-2 pb-2">
                <dt className="text-muted-foreground">Modelo:</dt>
                <dd className="font-medium text-right">{product.model}</dd>
              </div>
            )}
            {!hasGeneralData && (
              <div className="text-muted-foreground text-center py-4">
                Sem dados gerais
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Ruler className="w-4 h-4" /> Características
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            {product.warrantyDays && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">Garantia:</dt>
                <dd className="font-medium text-right">
                  {product.warrantyDays} dias
                </dd>
              </div>
            )}
            {product.weightGr && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">Peso:</dt>
                <dd className="font-medium text-right">
                  {product.weightGr >= 1000
                    ? `${(product.weightGr / 1000).toFixed(2)} kg`
                    : `${product.weightGr} g`}
                </dd>
              </div>
            )}
            {product.lengthMm && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">Comprimento:</dt>
                <dd className="font-medium text-right">
                  {product.lengthMm >= 10
                    ? `${(product.lengthMm / 10).toFixed(1)} cm`
                    : `${product.lengthMm} mm`}
                </dd>
              </div>
            )}
            {product.widthMm && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">Largura:</dt>
                <dd className="font-medium text-right">
                  {product.widthMm >= 10
                    ? `${(product.widthMm / 10).toFixed(1)} cm`
                    : `${product.widthMm} mm`}
                </dd>
              </div>
            )}
            {product.heightMm && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">Altura:</dt>
                <dd className="font-medium text-right">
                  {product.heightMm >= 10
                    ? `${(product.heightMm / 10).toFixed(1)} cm`
                    : `${product.heightMm} mm`}
                </dd>
              </div>
            )}
            {product.diameterMm && (
              <div className="grid grid-cols-2 gap-2 pb-2">
                <dt className="text-muted-foreground">Diâmetro:</dt>
                <dd className="font-medium text-right">
                  {product.diameterMm >= 10
                    ? `${(product.diameterMm / 10).toFixed(1)} cm`
                    : `${product.diameterMm} mm`}
                </dd>
              </div>
            )}
            {!hasPhysicalData && (
              <div className="text-muted-foreground text-center py-4">
                Sem características físicas
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Receipt className="w-4 h-4" /> Dados Fiscais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            {product.cfop && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">CFOP:</dt>
                <dd className="font-medium text-right">{product.cfop}</dd>
              </div>
            )}
            {product.cst && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">CST:</dt>
                <dd className="font-medium text-right">{product.cst}</dd>
              </div>
            )}
            {product.ean && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">EAN:</dt>
                <dd className="font-medium text-right">{product.ean}</dd>
              </div>
            )}
            {product.ncm && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">NCM:</dt>
                <dd className="font-medium text-right">{product.ncm}</dd>
              </div>
            )}
            {product.nbm && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">NBM:</dt>
                <dd className="font-medium text-right">{product.nbm}</dd>
              </div>
            )}
            {product.ppb && (
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <dt className="text-muted-foreground">PPB:</dt>
                <dd className="font-medium text-right">{product.ppb}</dd>
              </div>
            )}
            {product.temp && (
              <div className="grid grid-cols-2 gap-2 pb-2">
                <dt className="text-muted-foreground">TEMP:</dt>
                <dd className="font-medium text-right">{product.temp}</dd>
              </div>
            )}
            {!hasTaxData && (
              <div className="text-muted-foreground text-center py-4">
                Sem dados fiscais
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
