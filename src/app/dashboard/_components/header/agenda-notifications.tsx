import { getAgendaNotificationsForHeader } from "@/services/db/agenda";
import { AgendaNotificationsMenu } from "./agenda-notifications-menu";

interface AgendaNotificationsProps {
  userId: string;
  organizationId?: string | null;
}

function getMinuteKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:59`;
}

export async function AgendaNotifications({
  userId,
  organizationId,
}: AgendaNotificationsProps) {
  const result = await getAgendaNotificationsForHeader({
    userId,
    organizationId,
    dueBeforeKey: getMinuteKey(),
  });

  return (
    <AgendaNotificationsMenu
      notifications={result.notifications.map((notification) => ({
        id: notification.id,
        agendaEntryId: notification.agendaEntryId,
        title: notification.title,
        message: notification.message,
        notifyAt: notification.notifyAt.toISOString(),
        readAt: notification.readAt?.toISOString() ?? null,
      }))}
      error={result.error}
    />
  );
}
