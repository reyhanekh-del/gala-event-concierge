import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { EventCover } from "@/components/gala/Primitives";
import { events } from "@/mock/data";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/organizer/events/")({
  component: EventsList,
});

function EventsList() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const list = events.filter((e) => e.status === tab);

  return (
    <MobileShell
      tabs={organizerTabs}
      title="Events"
      right={
        <Link to="/organizer/events/new" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
          <Plus className="h-4 w-4" />
        </Link>
      }
    >
      <div className="px-5 pt-2">
        <div className="inline-flex rounded-full border bg-card p-1">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-3 pb-8">
        {list.map((e) => (
          <Link key={e.id} to="/organizer/events/$id" params={{ id: e.id }} className="block">
            <EventCover cover={e.cover} className="h-40">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest opacity-80">{format(new Date(e.date), "MMM d, yyyy")}</p>
                  <StatusChip status={e.status} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl leading-tight">{e.name}</h3>
                  <p className="text-xs opacity-75 mt-1">{e.city} · {e.host}</p>
                </div>
              </div>
            </EventCover>
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}

function StatusChip({ status }: { status: "upcoming" | "past" | "live" }) {
  const map = {
    upcoming: "bg-emerald-400/90 text-emerald-950 ring-1 ring-emerald-200/40",
    live: "bg-amber-400/95 text-amber-950 ring-1 ring-amber-200/40 animate-pulse",
    past: "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur",
  } as const;
  const dot = {
    upcoming: "bg-emerald-700",
    live: "bg-red-600",
    past: "bg-white/70",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest", map[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[status])} />
      {status}
    </span>
  );
}
