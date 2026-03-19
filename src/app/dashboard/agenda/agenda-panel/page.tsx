import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ListTodo,
  SearchX,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthContext } from "@/server/auth-context";
import { getAgendaEntriesForRange } from "@/services/db/agenda";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";
import { AgendaEntryDialog } from "./_components/agenda-entry-dialog";
import { AgendaEntryQuickActions } from "./_components/agenda-entry-quick-actions";
import {
  AGENDA_PRIORITY_OPTIONS,
  AGENDA_STATUS_OPTIONS,
  type AgendaPriorityValue,
  type AgendaStatusValue,
  formatDateTimeLabel,
  formatTimeLabel,
  getAgendaPriorityClassName,
  getAgendaPriorityLabel,
  getAgendaStatusLabel,
  getAgendaStatusVariant,
  getAgendaTypeLabel,
} from "./_components/agenda-ui-config";

interface AgendaPanelPageProps {
  searchParams: Promise<{
    date?: string;
    month?: string;
    status?: string;
    priority?: string;
  }>;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function parseDateKey(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseMonthKey(value?: string) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function getMonthRange(baseDate: Date) {
  const start = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    1,
    0,
    0,
    0,
  );
  const end = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  return { start, end };
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function getWeekdayLabel(index: number) {
  return ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"][index] ?? "";
}

function formatItemCount(count: number) {
  return `${count} ${count === 1 ? "item" : "itens"}`;
}

function buildCalendarDays(
  monthDate: Date,
  entryCountByDate: Map<string, number>,
) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const weekOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - weekOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);
    const dateKey = toDateKey(current);

    return {
      dateKey,
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === monthDate.getMonth(),
      isToday: dateKey === toDateKey(new Date()),
      count: entryCountByDate.get(dateKey) ?? 0,
    };
  });
}

function getNativeSelectClassName() {
  return "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]";
}

function isAgendaStatusValue(value?: string): value is AgendaStatusValue {
  return AGENDA_STATUS_OPTIONS.some((option) => option.value === value);
}

function isAgendaPriorityValue(value?: string): value is AgendaPriorityValue {
  return AGENDA_PRIORITY_OPTIONS.some((option) => option.value === value);
}

export default async function AgendaPanelPage(props: AgendaPanelPageProps) {
  await connection();

  const searchParams = await props.searchParams;
  const { session } = await getAuthContext();
  const today = new Date();
  const selectedDate = parseDateKey(searchParams.date) ?? today;
  const selectedDateKey = toDateKey(selectedDate);
  const monthDate =
    parseMonthKey(searchParams.month) ??
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthKey = toMonthKey(monthDate);
  const { start, end } = getMonthRange(monthDate);
  const currentStatus = isAgendaStatusValue(searchParams.status)
    ? searchParams.status
    : undefined;
  const currentPriority = isAgendaPriorityValue(searchParams.priority)
    ? searchParams.priority
    : undefined;

  const agendaData = await getAgendaEntriesForRange({
    userId: session.user.id,
    organizationId: session.session?.activeOrganizationId ?? null,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    status: currentStatus,
    priority: currentPriority,
  });

  const serializedEntries = agendaData.entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    notes: entry.notes,
    entryType: entry.entryType,
    status: entry.status,
    priority: entry.priority,
    scheduledAt: entry.scheduledAt.toISOString(),
    completedAt: entry.completedAt?.toISOString() ?? null,
  }));

  const selectedEntries = serializedEntries.filter((entry) =>
    entry.scheduledAt.startsWith(selectedDateKey),
  );
  const hasEntriesInMonth = serializedEntries.length > 0;
  const hasFiltersApplied = Boolean(currentStatus || currentPriority);
  const entryCountByDate = new Map<string, number>();

  for (const entry of serializedEntries) {
    const dateKey = entry.scheduledAt.slice(0, 10);
    entryCountByDate.set(dateKey, (entryCountByDate.get(dateKey) ?? 0) + 1);
  }

  const calendarDays = buildCalendarDays(monthDate, entryCountByDate);
  const completedCount = serializedEntries.filter(
    (entry) => entry.status === "concluido",
  ).length;
  const pendingCount = serializedEntries.filter(
    (entry) => entry.status === "pendente",
  ).length;
  const overdueCount = serializedEntries.filter((entry) => {
    if (entry.status === "concluido" || entry.status === "cancelado") {
      return false;
    }

    return new Date(entry.scheduledAt).getTime() < Date.now();
  }).length;
  const highPriorityCount = serializedEntries.filter(
    (entry) => entry.priority === "alta",
  ).length;
  const previousMonth = toMonthKey(addMonths(monthDate, -1));
  const nextMonth = toMonthKey(addMonths(monthDate, 1));
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(monthDate);
  const selectedDateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(selectedDate);
  const todayKey = toDateKey(today);
  const clearFiltersHref = `/dashboard/agenda/agenda-panel?month=${monthKey}&date=${selectedDateKey}`;
  const todayHref = `/dashboard/agenda/agenda-panel?month=${toMonthKey(today)}&date=${todayKey}&status=${currentStatus ?? ""}&priority=${currentPriority ?? ""}`;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Agenda"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Agenda", isActive: true },
        ]}
      />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6 py-6">
          <div className="px-4 lg:px-6">
            <div className="grid gap-6">
              <Card
                className="overflow-hidden border-0 text-white shadow-xl"
                style={{
                  background:
                    "radial-gradient(circle at top left, rgba(250,204,21,0.22), transparent 26%), linear-gradient(135deg, rgba(17,24,39,1), rgba(15,23,42,0.92))",
                }}
              >
                <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
                  <div className="space-y-4">
                    <Badge className="w-fit bg-white/14 text-white hover:bg-white/14">
                      Agenda operacional do vendedor
                    </Badge>
                    <div className="space-y-2">
                      <h1 className="text-2xl font-semibold tracking-tight lg:text-4xl">
                        Uma agenda simples, rápida e realmente útil para o dia a
                        dia.
                      </h1>
                      <p className="max-w-2xl text-sm leading-6 text-white/75 lg:text-base">
                        Controle tarefas, compromissos e lembretes em uma visão
                        combinada de calendário e lista, com prioridade, status
                        e alertas no header do sistema.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/6 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                          Seleção atual
                        </p>
                        <p className="mt-1 text-sm font-medium capitalize">
                          {selectedDateLabel}
                        </p>
                      </div>
                      <AgendaEntryDialog
                        mode="create"
                        defaultDateKey={selectedDateKey}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center gap-3">
                          <ListTodo className="h-5 w-5 text-amber-300" />
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                              Pendentes
                            </p>
                            <p className="text-2xl font-semibold">
                              {pendingCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-emerald-300" />
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                              Concluídas
                            </p>
                            <p className="text-2xl font-semibold">
                              {completedCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center gap-3">
                          <Clock3 className="h-5 w-5 text-rose-300" />
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                              Atrasadas
                            </p>
                            <p className="text-2xl font-semibold">
                              {overdueCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-sky-300" />
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                              Prioridade alta
                            </p>
                            <p className="text-2xl font-semibold">
                              {highPriorityCount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Filtros da agenda</CardTitle>
                  <CardDescription>
                    Ajuste o período, o status e a prioridade para focar no que
                    precisa ser executado agora.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]"
                    method="get"
                  >
                    <div className="space-y-2">
                      <label htmlFor="month" className="text-sm font-medium">
                        Mês de referência
                      </label>
                      <Input
                        id="month"
                        name="month"
                        type="month"
                        defaultValue={monthKey}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="date" className="text-sm font-medium">
                        Dia selecionado
                      </label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={selectedDateKey}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="status" className="text-sm font-medium">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        defaultValue={currentStatus ?? ""}
                        className={getNativeSelectClassName()}
                      >
                        <option value="">Todos os status</option>
                        {AGENDA_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="priority" className="text-sm font-medium">
                        Prioridade
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        defaultValue={currentPriority ?? ""}
                        className={getNativeSelectClassName()}
                      >
                        <option value="">Todas as prioridades</option>
                        {AGENDA_PRIORITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium"
                      >
                        Aplicar
                      </button>
                    </div>

                    <div className="flex items-end">
                      <Link
                        href={clearFiltersHref}
                        className="border-input inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium"
                      >
                        Limpar
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {agendaData.error ? (
                <Card className="border-amber-500/30 bg-amber-500/8">
                  <CardContent className="px-6 py-5 text-sm leading-6">
                    {agendaData.error}. Se as tabelas `agenda_entry` e
                    `agenda_notification` ainda não foram criadas no MariaDB do
                    projeto, finalize esse passo para liberar a operação
                    completa da Agenda.
                  </CardContent>
                </Card>
              ) : null}

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Card className="overflow-hidden">
                  <CardHeader className="border-b">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="capitalize">
                          {monthLabel}
                        </CardTitle>
                        <CardDescription>
                          Navegue pelo mês e selecione um dia para listar
                          rapidamente as tarefas do vendedor.
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/agenda/agenda-panel?month=${previousMonth}&date=${selectedDateKey}&status=${currentStatus ?? ""}&priority=${currentPriority ?? ""}`}
                          className="border-input inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium"
                        >
                          Mês anterior
                        </Link>
                        <Link
                          href={`/dashboard/agenda/agenda-panel?month=${nextMonth}&date=${selectedDateKey}&status=${currentStatus ?? ""}&priority=${currentPriority ?? ""}`}
                          className="border-input inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium"
                        >
                          Próximo mês
                        </Link>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 pb-4 pt-4 lg:px-6">
                    <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {Array.from({ length: 7 }, (_, index) => (
                        <div key={getWeekdayLabel(index)}>
                          {getWeekdayLabel(index)}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((day) => {
                        const isSelected = day.dateKey === selectedDateKey;

                        return (
                          <Link
                            key={day.dateKey}
                            href={`/dashboard/agenda/agenda-panel?month=${monthKey}&date=${day.dateKey}&status=${currentStatus ?? ""}&priority=${currentPriority ?? ""}`}
                            className={[
                              "group relative min-h-24 rounded-2xl border p-3 transition-all",
                              day.isCurrentMonth
                                ? "bg-card hover:bg-accent/40"
                                : "bg-muted/30 text-muted-foreground hover:bg-muted/50",
                              day.isToday
                                ? "border-amber-500/40 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]"
                                : "border-border/60",
                              isSelected ? "border-primary bg-primary/6" : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={[
                                  "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/60",
                                ].join(" ")}
                              >
                                {day.dayNumber}
                              </span>
                              {day.count > 0 ? (
                                <Badge variant="secondary">{day.count}</Badge>
                              ) : null}
                            </div>

                            <div className="mt-6 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {day.count > 0
                                ? `${day.count} item(ns)`
                                : "Sem itens"}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="capitalize">
                          Plano do dia
                        </CardTitle>
                        <CardDescription>
                          {selectedDateLabel} com{" "}
                          {formatItemCount(selectedEntries.length)}.
                        </CardDescription>
                      </div>

                      <AgendaEntryDialog
                        mode="create"
                        defaultDateKey={selectedDateKey}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="grid gap-4 px-4 py-4 lg:px-6">
                    {selectedEntries.length === 0 ? (
                      <div className="from-background via-muted/30 to-background flex min-h-56 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed bg-gradient-to-br p-6 text-center">
                        <div className="bg-primary/8 text-primary flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15">
                          {hasEntriesInMonth ? (
                            <CalendarDays
                              aria-hidden="true"
                              className="h-7 w-7"
                            />
                          ) : (
                            <SearchX aria-hidden="true" className="h-7 w-7" />
                          )}
                        </div>

                        <div className="max-w-md space-y-2">
                          <p className="text-foreground text-lg font-semibold tracking-tight text-balance">
                            {hasEntriesInMonth
                              ? "Este dia está livre na agenda."
                              : hasFiltersApplied
                                ? "Nenhum item encontrado com os filtros atuais."
                                : "Sua agenda ainda não tem itens programados."}
                          </p>
                          <p className="text-muted-foreground text-sm leading-6 text-pretty">
                            {hasEntriesInMonth
                              ? `Há ${formatItemCount(serializedEntries.length)} distribuídos em outros dias de ${monthLabel}. Você pode aproveitar a folga do dia ou registrar um novo item agora.`
                              : hasFiltersApplied
                                ? "Remova os filtros ativos para ampliar a busca ou crie um novo item para começar a montar a agenda operacional."
                                : "Crie o primeiro lembrete, tarefa ou compromisso para transformar a agenda em um painel de execução diário."}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <AgendaEntryDialog
                            mode="create"
                            defaultDateKey={selectedDateKey}
                          />
                          {hasFiltersApplied ? (
                            <Link
                              href={clearFiltersHref}
                              className="border-input inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium"
                            >
                              Limpar filtros
                            </Link>
                          ) : null}
                          {selectedDateKey !== todayKey ? (
                            <Link
                              href={todayHref}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-primary"
                            >
                              Ir para hoje
                              <ArrowRight
                                aria-hidden="true"
                                className="h-4 w-4"
                              />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {selectedEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-background rounded-2xl border p-4 shadow-sm transition-colors hover:bg-accent/20"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">
                                {getAgendaTypeLabel(entry.entryType)}
                              </Badge>
                              <Badge
                                variant={getAgendaStatusVariant(entry.status)}
                              >
                                {getAgendaStatusLabel(entry.status)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={getAgendaPriorityClassName(
                                  entry.priority,
                                )}
                              >
                                {getAgendaPriorityLabel(entry.priority)}
                              </Badge>
                            </div>

                            <div>
                              <h3 className="text-base font-semibold tracking-tight">
                                {entry.title}
                              </h3>
                              <p className="text-muted-foreground mt-1 text-sm">
                                {formatDateTimeLabel(entry.scheduledAt)}
                              </p>
                            </div>

                            {entry.notes ? (
                              <p className="text-muted-foreground text-sm leading-6">
                                {entry.notes}
                              </p>
                            ) : (
                              <p className="text-muted-foreground text-sm italic">
                                Sem observações adicionais.
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                              {formatTimeLabel(entry.scheduledAt)}
                            </div>
                            <AgendaEntryDialog
                              mode="update"
                              defaultDateKey={selectedDateKey}
                              entry={entry}
                            />
                          </div>
                        </div>

                        <div className="mt-4 border-t pt-4">
                          <AgendaEntryQuickActions entry={entry} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
