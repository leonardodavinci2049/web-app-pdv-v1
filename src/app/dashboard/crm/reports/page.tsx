import { BarChart3, Clock, TrendingUp, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/server/auth-context";
import { getCrmDealsByOrganization } from "@/services/db/crm-deal";
import {
  getCrmLeadStageCount,
  getCrmLeadsByOrganization,
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

export default async function ReportsPage() {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId ?? "";

  const [
    allLeadsResult,
    wonLeadsResult,
    lostLeadsResult,
    stagesResult,
    stageCountResult,
    dealsResult,
  ] = await Promise.all([
    getCrmLeadsByOrganization({ organizationId, limit: 5000 }),
    getCrmLeadsByOrganization({ organizationId, status: "won", limit: 5000 }),
    getCrmLeadsByOrganization({ organizationId, status: "lost", limit: 5000 }),
    getCrmActiveStages(),
    getCrmLeadStageCount({ organizationId }),
    getCrmDealsByOrganization({ organizationId, limit: 5000 }),
  ]);

  const allLeads = allLeadsResult.leads;
  const wonLeads = wonLeadsResult.leads;
  const lostLeads = lostLeadsResult.leads;
  const stages = stagesResult.stages;
  const stageCounts = stageCountResult.data;
  const deals = dealsResult.deals;

  // Conversion metrics
  const totalLeads = allLeads.length;
  const totalWon = wonLeads.length;
  const totalLost = lostLeads.length;
  const totalClosed = totalWon + totalLost;
  const conversionRate = totalClosed > 0 ? (totalWon / totalClosed) * 100 : 0;

  // Deal metrics
  const wonDeals = deals.filter((d) => d.status === "won");
  const totalDealValue = wonDeals.reduce((sum, d) => sum + d.amount, 0);
  const avgTicket = wonDeals.length > 0 ? totalDealValue / wonDeals.length : 0;

  // Average time to close is not available on CrmLeadSummary — omit or estimate from deals
  const avgCloseTime = 0;

  // Seller ranking
  const sellerMap = new Map<
    string,
    { name: string; won: number; total: number; value: number }
  >();
  for (const lead of allLeads) {
    const key = lead.assignedUserName;
    const entry = sellerMap.get(key) ?? {
      name: lead.assignedUserName,
      won: 0,
      total: 0,
      value: 0,
    };
    entry.total++;
    if (lead.status === "won") {
      entry.won++;
      entry.value += lead.estimatedValue ?? 0;
    }
    sellerMap.set(key, entry);
  }
  const sellerRanking = [...sellerMap.values()]
    .sort((a, b) => b.won - a.won)
    .slice(0, 10);

  // Stage funnel
  const sortedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Relatórios"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM", href: "/dashboard/crm" },
          { label: "Relatórios", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        <div>
          <h2 className="text-lg font-semibold">Relatórios CRM</h2>
          <p className="text-sm text-muted-foreground">
            Métricas de conversão, produtividade e carteira
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                {totalWon} ganhos / {totalClosed} fechados
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {avgTicket.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {wonDeals.length} negócio{wonDeals.length !== 1 ? "s" : ""}{" "}
                fechado{wonDeals.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo Médio de Fechamento
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {avgCloseTime > 0 ? `${avgCloseTime.toFixed(0)} dias` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                da criação ao fechamento
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Leads
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalLeads}</p>
              <p className="text-xs text-muted-foreground">
                {totalWon} ganhos &middot; {totalLost} perdidos
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Stage funnel */}
          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">Funil por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedStages.map((stage) => {
                  const count =
                    stageCounts.find((c) => c.stageKey === stage.stageKey)
                      ?.count ?? 0;
                  const maxCount = Math.max(
                    ...stageCounts.map((c) => c.count),
                    1,
                  );
                  const width = Math.max((count / maxCount) * 100, 4);

                  return (
                    <div key={stage.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {STAGE_LABELS[stage.stageKey] ?? stage.stageKey}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Seller ranking */}
          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4" />
                Ranking de Vendedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sellerRanking.length > 0 ? (
                <div className="space-y-3">
                  {sellerRanking.map((seller, index) => {
                    const rate =
                      seller.total > 0
                        ? ((seller.won / seller.total) * 100).toFixed(0)
                        : "0";
                    return (
                      <div
                        key={seller.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{seller.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {seller.won}/{seller.total}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rate}%
                          </Badge>
                          {seller.value > 0 && (
                            <span className="text-xs font-medium">
                              {seller.value.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum vendedor encontrado.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
