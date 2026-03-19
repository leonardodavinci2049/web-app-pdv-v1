"use client";

import { Bell, Clock3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { markAgendaNotificationAsReadAction } from "@/app/dashboard/agenda/agenda-panel/_actions/agenda-actions";
import {
  formatDateTimeLabel,
  type SerializedAgendaNotification,
} from "@/app/dashboard/agenda/agenda-panel/_components/agenda-ui-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgendaNotificationsMenuProps {
  notifications: SerializedAgendaNotification[];
  error?: string | null;
}

export function AgendaNotificationsMenu({
  notifications,
  error,
}: AgendaNotificationsMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const markAsRead = (notificationId: string) => {
    startTransition(async () => {
      const result = await markAgendaNotificationAsReadAction(notificationId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-full"
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 ? (
            <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-black">
              {notifications.length}
            </span>
          ) : null}
          <span className="sr-only">Abrir alertas da agenda</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[22rem] rounded-xl p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Alertas da agenda</p>
            <p className="text-muted-foreground text-xs">
              Lembretes do vendedor para hoje e horários vencidos.
            </p>
          </div>
          <Badge variant="secondary">{notifications.length}</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto p-2">
          {error ? (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm">
              {error}
            </div>
          ) : null}

          {!error && notifications.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg p-6 text-center text-sm">
              <Clock3 className="h-5 w-5" />
              Nenhum alerta pendente na agenda.
            </div>
          ) : null}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-background hover:bg-accent/40 mb-2 rounded-lg border p-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-tight">
                    {notification.title}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {notification.message ||
                      "Alerta da agenda pronto para revisão."}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {formatDateTimeLabel(notification.notifyAt)}
                  </p>
                </div>
                <Badge variant="outline">Agenda</Badge>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <Button variant="link" size="sm" asChild className="px-0">
                  <Link
                    href={`/dashboard/agenda/agenda-panel?date=${notification.notifyAt.slice(0, 10)}`}
                  >
                    Abrir agenda
                  </Link>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => markAsRead(notification.id)}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Marcar como lido
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
