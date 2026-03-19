export const AGENDA_TYPE_OPTIONS = [
  { value: "lembrete", label: "Lembrete" },
  { value: "tarefa", label: "Tarefa" },
  { value: "compromisso", label: "Compromisso" },
] as const;

export const AGENDA_STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
  { value: "adiado", label: "Adiado" },
] as const;

export const AGENDA_PRIORITY_OPTIONS = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
] as const;

const AGENDA_TIME_STEP_MINUTES = 5;

export type AgendaTypeValue = (typeof AGENDA_TYPE_OPTIONS)[number]["value"];
export type AgendaStatusValue = (typeof AGENDA_STATUS_OPTIONS)[number]["value"];
export type AgendaPriorityValue =
  (typeof AGENDA_PRIORITY_OPTIONS)[number]["value"];

export interface SerializedAgendaEntry {
  id: string;
  title: string;
  notes: string | null;
  entryType: AgendaTypeValue;
  status: AgendaStatusValue;
  priority: AgendaPriorityValue;
  scheduledAt: string;
  completedAt: string | null;
}

export interface SerializedAgendaNotification {
  id: string;
  agendaEntryId: string;
  title: string;
  message: string | null;
  notifyAt: string;
  readAt: string | null;
}

export function getAgendaTypeLabel(value: AgendaTypeValue) {
  return (
    AGENDA_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

export function getAgendaStatusLabel(value: AgendaStatusValue) {
  return (
    AGENDA_STATUS_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function getAgendaPriorityLabel(value: AgendaPriorityValue) {
  return (
    AGENDA_PRIORITY_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function getAgendaStatusVariant(value: AgendaStatusValue) {
  if (value === "concluido") return "default" as const;
  if (value === "cancelado") return "destructive" as const;
  if (value === "em_andamento") return "secondary" as const;
  return "outline" as const;
}

export function getAgendaPriorityClassName(value: AgendaPriorityValue) {
  if (value === "alta") {
    return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300";
  }

  if (value === "media") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

export function formatDateTimeLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatTimeLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function toDateTimeLocalValue(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function roundDateUpToAgendaStep(value: Date) {
  const date = new Date(value);
  date.setSeconds(0, 0);

  const minutes = date.getMinutes();
  const remainder = minutes % AGENDA_TIME_STEP_MINUTES;

  if (remainder !== 0) {
    date.setMinutes(minutes + (AGENDA_TIME_STEP_MINUTES - remainder));
  }

  return date;
}

function parseDateKeyAsLocalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getNowDateTimeLocalValue() {
  return toDateTimeLocalValue(
    roundDateUpToAgendaStep(new Date()).toISOString(),
  );
}

export function getSuggestedAgendaDateTimeLocalValue(dateKey: string) {
  const minDate = roundDateUpToAgendaStep(new Date());
  const selectedDate = parseDateKeyAsLocalDate(dateKey);

  if (!selectedDate) {
    return toDateTimeLocalValue(minDate.toISOString());
  }

  const selectedDateStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    0,
    0,
    0,
    0,
  );
  const minDateStart = new Date(
    minDate.getFullYear(),
    minDate.getMonth(),
    minDate.getDate(),
    0,
    0,
    0,
    0,
  );

  if (selectedDateStart.getTime() <= minDateStart.getTime()) {
    return toDateTimeLocalValue(minDate.toISOString());
  }

  const suggestedDate = new Date(selectedDateStart);
  suggestedDate.setHours(9, 0, 0, 0);

  return toDateTimeLocalValue(suggestedDate.toISOString());
}
