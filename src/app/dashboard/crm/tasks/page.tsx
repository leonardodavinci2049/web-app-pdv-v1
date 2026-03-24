import { Calendar, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/server/auth-context";
import {
  getCrmOverdueTaskCount,
  getCrmTasksByUser,
} from "@/services/db/crm-task";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";
import { TaskStatusButton } from "../_components/task-status-button";

const PRIORITY_LABELS: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export default async function TasksPage() {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId ?? "";
  const userId = session.user.id;

  const [tasksResult, overdueResult] = await Promise.all([
    getCrmTasksByUser({
      assignedUserId: userId,
      organizationId,
      limit: 100,
    }),
    getCrmOverdueTaskCount({ organizationId, assignedUserId: userId }),
  ]);

  const tasks = tasksResult.tasks;
  const overdue = overdueResult.count;

  const pendingTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "in_progress",
  );
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Tarefas"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM", href: "/dashboard/crm" },
          { label: "Tarefas", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Tarefas e Follow-ups</h2>
            <p className="text-sm text-muted-foreground">
              {pendingTasks.length} pendente
              {pendingTasks.length !== 1 ? "s" : ""}
              {overdue > 0 && (
                <span className="text-destructive">
                  {" "}
                  &middot; {overdue} atrasada{overdue !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Pending Tasks */}
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length > 0 ? (
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const dueDate = new Date(task.dueDate);
                  const isOverdue = dueDate < new Date();

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-md border border-border/40 px-3 py-2"
                    >
                      <TaskStatusButton taskId={task.id} leadId={task.leadId} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {task.title}
                        </p>
                        <Link
                          href={`/dashboard/crm/leads/${task.leadId}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {task.leadName}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.priority === "high" ? "destructive" : "outline"
                          }
                          className="text-xs"
                        >
                          {PRIORITY_LABELS[task.priority] ?? task.priority}
                        </Badge>
                        <span
                          className={`flex items-center gap-1 text-xs ${isOverdue ? "font-medium text-destructive" : "text-muted-foreground"}`}
                        >
                          <Calendar className="h-3 w-3" />
                          {dueDate.toLocaleDateString("pt-BR")}
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

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-md px-3 py-2 opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm line-through">
                        {task.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {task.leadName}
                      </span>
                    </div>
                    {task.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.completedAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
