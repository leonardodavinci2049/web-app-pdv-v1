import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { AgendaService } from "./agenda.service";
import type {
  AgendaEntry,
  AgendaEntryPriority,
  AgendaEntryStatus,
  AgendaNotification,
} from "./types/agenda.types";

interface AgendaEntriesParams {
  userId: string;
  organizationId?: string | null;
  startDate: string;
  endDate: string;
  status?: AgendaEntryStatus;
  priority?: AgendaEntryPriority;
}

interface AgendaNotificationsParams {
  userId: string;
  organizationId?: string | null;
  dueBeforeKey: string;
}

export interface AgendaEntriesResult {
  entries: AgendaEntry[];
  error: string | null;
}

export interface AgendaNotificationsResult {
  notifications: AgendaNotification[];
  error: string | null;
}

export async function getAgendaEntriesForRange(
  params: AgendaEntriesParams,
): Promise<AgendaEntriesResult> {
  "use cache";

  cacheLife("seconds");
  cacheTag(
    CACHE_TAGS.agendaEntries,
    CACHE_TAGS.agendaEntriesByUser(params.userId),
  );

  const response = await AgendaService.findAgendaEntriesByUser({
    userId: params.userId,
    organizationId: params.organizationId,
    startDate: params.startDate,
    endDate: params.endDate,
    status: params.status,
    priority: params.priority,
    limit: 200,
  });

  return {
    entries: response.data ?? [],
    error: response.success ? null : response.error,
  };
}

export async function getAgendaNotificationsForHeader(
  params: AgendaNotificationsParams,
): Promise<AgendaNotificationsResult> {
  "use cache";

  cacheLife("seconds");
  cacheTag(
    CACHE_TAGS.agendaNotifications,
    CACHE_TAGS.agendaNotificationsByUser(params.userId),
  );

  const response = await AgendaService.findAgendaNotificationsByUser({
    userId: params.userId,
    organizationId: params.organizationId,
    unreadOnly: true,
    dueBefore: params.dueBeforeKey,
    limit: 12,
  });

  return {
    notifications: response.data ?? [],
    error: response.success ? null : response.error,
  };
}
