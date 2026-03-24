import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthContext } from "@/server/auth-context";
import {
  getCrmLeadStageCount,
  getCrmLeadsByStageGrouped,
} from "@/services/db/crm-lead";
import { getCrmActiveStages } from "@/services/db/crm-stage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contact: "Contato",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Fechado",
  lost: "Perdido",
};

const STAGE_COLORS: Record<string, string> = {
  lead: "border-t-blue-500",
  contact: "border-t-cyan-500",
  proposal: "border-t-amber-500",
  negotiation: "border-t-purple-500",
  won: "border-t-green-500",
  lost: "border-t-red-500",
};

export default async function PipelinePage() {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId ?? "";

  const [stagesResult, leadsResult, stageCountResult] = await Promise.all([
    getCrmActiveStages(),
    getCrmLeadsByStageGrouped({ organizationId }),
    getCrmLeadStageCount({ organizationId }),
  ]);

  const stages = stagesResult.stages.filter((s) => s.stageKey !== "lost");
  const leads = leadsResult.leads;
  const stageCounts = stageCountResult.data;

  const leadsByStage = new Map<string, typeof leads>();
  for (const stage of stages) {
    leadsByStage.set(
      stage.stageKey,
      leads.filter((l) => l.currentStageKey === stage.stageKey),
    );
  }

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Pipeline"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM", href: "/dashboard/crm" },
          { label: "Pipeline", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Pipeline de Vendas</h2>
            <p className="text-sm text-muted-foreground">
              Visão geral do funil comercial
            </p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = leadsByStage.get(stage.stageKey) ?? [];
            const stageData = stageCounts.find(
              (sc) => sc.stageKey === stage.stageKey,
            );
            const totalValue = stageData?.total ?? 0;

            return (
              <div
                key={stage.stageKey}
                className="flex w-72 shrink-0 flex-col md:w-80"
              >
                <div
                  className={`rounded-t-lg border border-b-0 border-border/60 bg-muted/30 px-4 py-3 border-t-4 ${STAGE_COLORS[stage.stageKey] ?? "border-t-gray-400"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      {STAGE_LABELS[stage.stageKey] ?? stage.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  {totalValue > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {totalValue.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex min-h-[200px] flex-col gap-2 rounded-b-lg border border-border/60 bg-card/30 p-2">
                  {stageLeads.map((lead) => {
                    const isOverdue =
                      lead.nextFollowUpAt &&
                      new Date(lead.nextFollowUpAt) < new Date();

                    return (
                      <Link
                        key={lead.id}
                        href={`/dashboard/crm/leads/${lead.id}`}
                      >
                        <Card className="border-border/60 bg-card transition-colors hover:bg-accent/50">
                          <CardContent className="p-3">
                            <p className="truncate text-sm font-medium">
                              {lead.name}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <Badge variant="outline" className="text-[10px]">
                                {lead.source}
                              </Badge>
                              {lead.score > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {lead.score}pts
                                </Badge>
                              )}
                              {isOverdue && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px]"
                                >
                                  Atrasado
                                </Badge>
                              )}
                            </div>
                            {lead.estimatedValue && (
                              <p className="mt-1 text-xs font-medium text-muted-foreground">
                                {lead.estimatedValue.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </p>
                            )}
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {lead.assignedUserName}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                  {stageLeads.length === 0 && (
                    <div className="flex flex-1 items-center justify-center">
                      <p className="text-xs text-muted-foreground">
                        Nenhum lead
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
