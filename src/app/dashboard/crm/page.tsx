import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Kanban,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/server/auth-context";
import {
  getCrmLeadStageCount,
  getCrmLeadsByOrganization,
} from "@/services/db/crm-lead";
import { getCrmActiveStages } from "@/services/db/crm-stage";
import {
  getCrmOverdueTaskCount,
  getCrmTasksByUser,
} from "@/services/db/crm-task";
import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contact: "Contato",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Fechado",
  lost: "Perdido",
};

export default async function CrmDashboardPage() {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId ?? "";
  const userId = session.user.id;

  const [
    stagesResult,
    stageCountResult,
    overdueResult,
    tasksResult,
    recentLeadsResult,
  ] = await Promise.all([
    getCrmActiveStages(),
    getCrmLeadStageCount({ organizationId }),
    getCrmOverdueTaskCount({ organizationId, assignedUserId: userId }),
    getCrmTasksByUser({
      assignedUserId: userId,
      organizationId,
      status: "pending",
      limit: 5,
    }),
    getCrmLeadsByOrganization({ organizationId, status: "open", limit: 5 }),
  ]);

  const stageCounts = stageCountResult.data;
  const totalOpenLeads = stageCounts.reduce((sum, s) => sum + s.count, 0);
  const totalValue = stageCounts.reduce((sum, s) => sum + s.total, 0);
  const overdueTasks = overdueResult.count;
  const pendingTasks = tasksResult.tasks;
  const recentLeads = recentLeadsResult.leads;

  const quickLinks = [
    { label: "Pipeline", href: "/dashboard/crm/pipeline", icon: Kanban },
    { label: "Leads", href: "/dashboard/crm/leads", icon: Users },
    { label: "Tarefas", href: "/dashboard/crm/tasks", icon: ClipboardList },
    { label: "Relatórios", href: "/dashboard/crm/reports", icon: TrendingUp },
  ];

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="CRM"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="border-border/60 bg-card/70 transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <link.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{link.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Leads Abertos
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOpenLeads}</div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total Pipeline
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tarefas Atrasadas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {overdueTasks}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Etapas Ativas
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  stagesResult.stages.filter(
                    (s) => s.stageKey !== "won" && s.stageKey !== "lost",
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Summary + Leads/Tasks */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pipeline by stage */}
          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">Funil por Etapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stagesResult.stages
                .filter((s) => s.stageKey !== "lost")
                .map((stage) => {
                  const stageData = stageCounts.find(
                    (sc) => sc.stageKey === stage.stageKey,
                  );
                  const count = stageData?.count ?? 0;
                  const total = stageData?.total ?? 0;
                  const percentage =
                    totalOpenLeads > 0
                      ? Math.round((count / totalOpenLeads) * 100)
                      : 0;

                  return (
                    <div key={stage.stageKey} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {STAGE_LABELS[stage.stageKey] ?? stage.name}
                        </span>
                        <span className="text-muted-foreground">
                          {count} leads &middot;{" "}
                          {total.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {stageCounts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum lead no funil ainda.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent leads */}
          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Leads Recentes</CardTitle>
              <Link
                href="/dashboard/crm/leads"
                className="text-xs text-primary hover:underline"
              >
                Ver todos
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/crm/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-accent/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {STAGE_LABELS[lead.currentStageKey] ??
                        lead.currentStageKey}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                    {lead.source}
                  </Badge>
                </Link>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum lead cadastrado.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Tasks */}
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Próximas Tarefas</CardTitle>
            <Link
              href="/dashboard/crm/tasks"
              className="text-xs text-primary hover:underline"
            >
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {pendingTasks.length > 0 ? (
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const isOverdue = new Date(task.dueDate) < new Date();
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-md px-2 py-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.leadName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.priority === "high" ? "destructive" : "outline"
                          }
                          className="text-xs"
                        >
                          {task.priority === "high"
                            ? "Alta"
                            : task.priority === "medium"
                              ? "Média"
                              : "Baixa"}
                        </Badge>
                        <span
                          className={`text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
                        >
                          {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma tarefa pendente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
