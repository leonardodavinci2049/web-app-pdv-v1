import { ArrowLeftRight, Calendar, Mail, Phone, User } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/server/auth-context";
import { getCrmActivitiesByLead } from "@/services/db/crm-activity";
import { getCrmDealByLead } from "@/services/db/crm-deal";
import { getCrmLeadById } from "@/services/db/crm-lead";
import { getCrmLeadStageHistory } from "@/services/db/crm-lead-stage-history";
import { getCrmActiveStages } from "@/services/db/crm-stage";
import { getCrmTasksByLead } from "@/services/db/crm-task";
import { SiteHeaderWithBreadcrumb } from "../../../_components/header/site-header-with-breadcrumb";
import { LeadActions } from "../../_components/lead-actions";
import { LeadActivityForm } from "../../_components/lead-activity-form";
import { LeadStageSelector } from "../../_components/lead-stage-selector";
import { LeadTaskForm } from "../../_components/lead-task-form";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contact: "Contato",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Fechado",
  lost: "Perdido",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  ligacao: "Ligação",
  mensagem: "Mensagem",
  visita: "Visita",
  anotacao: "Anotação",
  mudanca_etapa: "Mudança de Etapa",
  orcamento: "Orçamento",
  pedido: "Pedido",
};

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId ?? "";
  const { id } = await params;

  const [
    leadResult,
    stagesResult,
    historyResult,
    activitiesResult,
    tasksResult,
    dealResult,
  ] = await Promise.all([
    getCrmLeadById({ leadId: id, organizationId }),
    getCrmActiveStages(),
    getCrmLeadStageHistory({ leadId: id }),
    getCrmActivitiesByLead({ leadId: id }),
    getCrmTasksByLead({ leadId: id }),
    getCrmDealByLead({ leadId: id }),
  ]);

  const lead = leadResult.lead;
  if (!lead) notFound();

  const stages = stagesResult.stages;
  const history = historyResult.history;
  const activities = activitiesResult.activities;
  const tasks = tasksResult.tasks;
  const deal = dealResult.deal;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title={lead.name}
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM", href: "/dashboard/crm" },
          { label: "Leads", href: "/dashboard/crm/leads" },
          { label: lead.name, isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        {/* Header with stage selector */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{lead.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {lead.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {lead.phone}
                </span>
              )}
              {lead.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {lead.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {lead.assignedUserName}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {STAGE_LABELS[lead.currentStageKey] ?? lead.currentStageKey}
              </Badge>
              <Badge variant="outline">{lead.source}</Badge>
              {lead.score > 0 && (
                <Badge variant="outline">Score: {lead.score}</Badge>
              )}
              {lead.status === "won" && (
                <Badge className="bg-green-600 text-white">Ganho</Badge>
              )}
              {lead.status === "lost" && (
                <Badge variant="destructive">Perdido</Badge>
              )}
            </div>
          </div>
          {lead.status === "open" && (
            <LeadActions
              leadId={lead.id}
              currentStageKey={lead.currentStageKey}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Stage selector */}
            {lead.status === "open" && (
              <Card className="border-border/60 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">Etapa do Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeadStageSelector
                    leadId={lead.id}
                    currentStageKey={lead.currentStageKey}
                    stages={stages.filter((s) => s.stageKey !== "lost")}
                  />
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card className="border-border/60 bg-card/70">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Timeline</CardTitle>
                <LeadActivityForm leadId={lead.id} />
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-3 border-l-2 border-border pl-4"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {ACTIVITY_TYPE_LABELS[activity.activityType] ??
                                activity.activityType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleString(
                                "pt-BR",
                              )}
                            </span>
                          </div>
                          <p className="mt-1 text-sm">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade registrada.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stage History */}
            <Card className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle className="text-base">Histórico de Etapas</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {h.fromStageKey
                            ? `${STAGE_LABELS[h.fromStageKey] ?? h.fromStageKey} → `
                            : "Início → "}
                          {STAGE_LABELS[h.toStageKey] ?? h.toStageKey}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(h.changedAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem histórico de transições.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Info */}
            <Card className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle className="text-base">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {lead.estimatedValue && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Valor Estimado
                    </span>
                    <span className="font-medium">
                      {lead.estimatedValue.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                )}
                {lead.nextFollowUpAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Próximo Follow-up
                    </span>
                    <span
                      className={`font-medium ${new Date(lead.nextFollowUpAt) < new Date() ? "text-destructive" : ""}`}
                    >
                      {new Date(lead.nextFollowUpAt).toLocaleDateString(
                        "pt-BR",
                      )}
                    </span>
                  </div>
                )}
                {lead.lastContactAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Último Contato
                    </span>
                    <span>
                      {new Date(lead.lastContactAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em</span>
                  <span>
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {lead.customerId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente ID</span>
                    <span className="font-mono text-xs">{lead.customerId}</span>
                  </div>
                )}
                {lead.lostReason && (
                  <div>
                    <span className="text-muted-foreground">
                      Motivo da Perda
                    </span>
                    <p className="mt-1 text-sm">{lead.lostReason}</p>
                  </div>
                )}
                {lead.notes && (
                  <div>
                    <span className="text-muted-foreground">Observações</span>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {lead.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deal info */}
            {deal && (
              <Card className="border-border/60 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">Negócio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor</span>
                    <span className="font-medium">
                      {deal.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        deal.status === "won"
                          ? "default"
                          : deal.status === "lost"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {deal.status === "won"
                        ? "Ganho"
                        : deal.status === "lost"
                          ? "Perdido"
                          : "Aberto"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tasks */}
            <Card className="border-border/60 bg-card/70">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Tarefas</CardTitle>
                <LeadTaskForm leadId={lead.id} />
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map((task) => {
                      const isOverdue =
                        task.status !== "completed" &&
                        task.status !== "cancelled" &&
                        new Date(task.dueDate) < new Date();
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                            >
                              {task.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span
                              className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
                            >
                              {new Date(task.dueDate).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma tarefa.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
