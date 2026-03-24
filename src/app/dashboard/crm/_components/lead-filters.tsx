"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STAGE_OPTIONS = [
  { key: "", label: "Todas" },
  { key: "lead", label: "Lead" },
  { key: "contact", label: "Contato" },
  { key: "proposal", label: "Proposta" },
  { key: "negotiation", label: "Negociação" },
  { key: "won", label: "Fechado" },
  { key: "lost", label: "Perdido" },
];

const STATUS_OPTIONS = [
  { key: "", label: "Abertos" },
  { key: "won", label: "Ganhos" },
  { key: "lost", label: "Perdidos" },
];

const SOURCE_OPTIONS = [
  { key: "", label: "Todas" },
  { key: "indicacao", label: "Indicação" },
  { key: "site", label: "Site" },
  { key: "telefone", label: "Telefone" },
  { key: "visita", label: "Visita" },
  { key: "rede_social", label: "Rede Social" },
  { key: "campanha", label: "Campanha" },
  { key: "outros", label: "Outros" },
];

export function LeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStage = searchParams.get("stage") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentSource = searchParams.get("source") ?? "";

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/crm/leads?${params.toString()}`);
  }

  const hasFilters = currentStage || currentStatus || currentSource;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Status:
        </span>
        {STATUS_OPTIONS.map((opt) => (
          <Badge
            key={opt.key}
            variant={currentStatus === opt.key ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => applyFilter("status", opt.key)}
          >
            {opt.label}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Etapa:
        </span>
        {STAGE_OPTIONS.map((opt) => (
          <Badge
            key={opt.key}
            variant={currentStage === opt.key ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => applyFilter("stage", opt.key)}
          >
            {opt.label}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Origem:
        </span>
        {SOURCE_OPTIONS.map((opt) => (
          <Badge
            key={opt.key}
            variant={currentSource === opt.key ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => applyFilter("source", opt.key)}
          >
            {opt.label}
          </Badge>
        ))}
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => router.push("/dashboard/crm/leads")}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
