import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, EventCover } from "@/components/gala/Primitives";
import { usePlannerStore, resolveEventLocation } from "@/mock/plannerStore";
import { format } from "date-fns";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner/events/")({
  head: () => ({
    meta: [
      { title: "Planner Events | Gala Event Planner" },
      { name: "description", content: "Every event you run, across saved and one-time locations, with confirmations and credit usage." },
      { property: "og:title", content: "Planner Events | Gala Event Planner" },
      { property: "og:description", content: "All planner events across multiple locations in one list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerEvents,
});

const FILTERS = ["All", "Upcoming", "Past", "One-time locations"] as const;

function PlannerEvents() {
  const { events } = usePlannerStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = events.filter((e) => {
    if (filter === "Upcoming") return e.status === "upcoming" || e.status === "live";
    if (filter === "Past") return e.status === "past";
    if (filter === "One-time locations") return e.location.kind === "one-time";
    return true;
  });

  return (
    <div>
      <SectionHeader
        title="Events"
        subtitle={`${events.length} total`}
        action={
          <Link to="/planner/events/new" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            <Plus className="h-4 w-4" /> New event
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((e) => {
          const loc = resolveEventLocation(e);
          return (
            <Link key={e.id} to="/planner/events/$id" params={{ id: e.id }} className="block">
              <EventCover cover={e.cover} className="h-52">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest opacity-75">{format(new Date(e.date), "MMM d, yyyy")}</p>
                    <span className="rounded-full border border-current/30 px-2 py-0.5 text-[10px] uppercase tracking-widest opacity-75">{e.status}</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl leading-tight">{e.name}</h3>
                    <p className="mt-1 text-xs opacity-75">{e.host}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs opacity-75">
                      <MapPin className="h-3 w-3" /> {loc.name} · {loc.city}
                      {loc.kind === "one-time" && <span className="rounded-full border border-current/30 px-1.5 py-0.5 text-[9px] uppercase tracking-widest">one-time</span>}
                    </p>
                  </div>
                </div>
              </EventCover>
            </Link>
          );
        })}
      </div>
      {list.length === 0 && <p className="text-sm text-muted-foreground">No events match this filter.</p>}
    </div>
  );
}
