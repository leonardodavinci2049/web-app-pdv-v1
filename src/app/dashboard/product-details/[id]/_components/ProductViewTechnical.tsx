import { Clock, Globe, Hash, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";

interface ProductViewTechnicalProps {
  product: UIProductPdv;
}

export function ProductViewTechnical({ product }: ProductViewTechnicalProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(date)
        .replace(", ", " às ");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Settings className="w-4 h-4" /> Classificação Técnica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4 text-sm mt-2">
            <div>
              <dt className="text-muted-foreground mb-1">
                Marca / Fabricante:
              </dt>
              <dd className="font-medium bg-slate-100 dark:bg-slate-800 p-3 rounded-md border flex items-center gap-3">
                {product.brand ? (
                  <span className="flex-1">{product.brand}</span>
                ) : (
                  <span className="text-muted-foreground italic">
                    Não informada
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground mb-1">
                Tipo de Produto (PTYPE):
              </dt>
              <dd className="font-medium bg-slate-100 dark:bg-slate-800 p-3 rounded-md border">
                {product.type ? (
                  product.type
                ) : (
                  <span className="text-muted-foreground italic">
                    Não informado
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Globe className="w-4 h-4" /> SEO & Metadados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4 text-sm mt-2">
            <div className="pt-2">
              <dt className="text-muted-foreground flex items-center gap-2">
                <Hash className="w-3 h-3" /> Slug da URL:
              </dt>
              <dd className="font-mono text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded mt-1 break-all border">
                {product.slug || (
                  <span className="text-muted-foreground font-sans italic">
                    Não informado
                  </span>
                )}
              </dd>
            </div>
            <div className="pt-2">
              <dt className="text-muted-foreground mb-1">
                Meta Title ({product.metaTitle?.length || 0} chars):
              </dt>
              <dd className="font-medium">
                {product.metaTitle || (
                  <span className="text-muted-foreground italic">
                    Padrão da loja
                  </span>
                )}
              </dd>
            </div>
            <div className="border-t pt-2 mt-2">
              <dt className="text-muted-foreground mb-1">
                Meta Description ({product.metaDescription?.length || 0} chars):
              </dt>
              <dd className="font-medium text-xs leading-relaxed">
                {product.metaDescription || (
                  <span className="text-muted-foreground italic">
                    Padrão da loja
                  </span>
                )}
              </dd>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
              <div>
                <dt className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" /> Criado em:
                </dt>
                <dd className="font-medium text-xs mt-1">
                  {formatDate(product.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" /> Atualizado em:
                </dt>
                <dd className="font-medium text-xs mt-1">
                  {formatDate(product.updatedAt)}
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
