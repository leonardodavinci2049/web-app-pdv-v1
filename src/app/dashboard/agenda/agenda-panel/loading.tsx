import {
  type CalendarDays,
  Clock3,
  ListTodo,
  Sparkles,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const WEEKDAY_SKELETON_KEYS = [
  "weekday-mon",
  "weekday-tue",
  "weekday-wed",
  "weekday-thu",
  "weekday-fri",
  "weekday-sat",
  "weekday-sun",
] as const;

const CALENDAR_DAY_SKELETON_KEYS = [
  "day-01",
  "day-02",
  "day-03",
  "day-04",
  "day-05",
  "day-06",
  "day-07",
  "day-08",
  "day-09",
  "day-10",
  "day-11",
  "day-12",
  "day-13",
  "day-14",
  "day-15",
  "day-16",
  "day-17",
  "day-18",
  "day-19",
  "day-20",
  "day-21",
  "day-22",
  "day-23",
  "day-24",
  "day-25",
  "day-26",
  "day-27",
  "day-28",
  "day-29",
  "day-30",
  "day-31",
  "day-32",
  "day-33",
  "day-34",
  "day-35",
] as const;

const ENTRY_SKELETON_KEYS = ["entry-a", "entry-b", "entry-c"] as const;

function MetricSkeleton({ icon: Icon }: { icon: typeof CalendarDays }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-center gap-3">
        <Icon aria-hidden="true" className="h-5 w-5 text-white/60" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 bg-white/14" />
          <Skeleton className="h-7 w-12 bg-white/14" />
        </div>
      </div>
    </div>
  );
}

export default function AgendaPanelLoading() {
  return (
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
                  <Skeleton className="h-6 w-44 bg-white/14" />
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full max-w-xl bg-white/14" />
                    <Skeleton className="h-4 w-full max-w-2xl bg-white/14" />
                    <Skeleton className="h-4 w-3/4 max-w-xl bg-white/14" />
                  </div>
                </div>

                <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/6 px-4 py-3">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24 bg-white/14" />
                      <Skeleton className="h-4 w-36 bg-white/14" />
                    </div>
                    <Skeleton className="h-9 w-28 bg-white/14" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricSkeleton icon={ListTodo} />
                    <MetricSkeleton icon={Target} />
                    <MetricSkeleton icon={Clock3} />
                    <MetricSkeleton icon={Sparkles} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full max-w-2xl" />
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-9 rounded-md" />
                <Skeleton className="h-9 rounded-md" />
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
                <CardHeader className="border-b space-y-3">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full max-w-lg" />
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-4 lg:px-6">
                  <div className="mb-3 grid grid-cols-7 gap-2">
                    {WEEKDAY_SKELETON_KEYS.map((key) => (
                      <Skeleton key={key} className="h-4" />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {CALENDAR_DAY_SKELETON_KEYS.map((key) => (
                      <Skeleton key={key} className="min-h-24 rounded-2xl" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b space-y-3">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-full max-w-sm" />
                </CardHeader>
                <CardContent className="grid gap-4 px-4 py-4 lg:px-6">
                  {ENTRY_SKELETON_KEYS.map((key) => (
                    <div key={key} className="rounded-2xl border p-4 shadow-sm">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-5 w-24 rounded-full" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
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
  );
}
