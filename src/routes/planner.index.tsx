import { createFileRoute, Link } from "@tanstack/react-router";
import { StatCard, SectionHeader, EventCover } from "@/components/gala/Primitives";
import { usePlannerStore, plannerCredits, resolveEventLocation } from "@/mock/plannerStore";
import { MapPin, Plus } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/planner/")({
  head: () => ({
    meta: [
      { title: "Event Planner Dashboard | Gala" },
      { name: "description", content: "Track events across every location, saved venues, credits and confirmations from the Gala event planner portal." },
      { property: "og:title", content: "Event Planner Dashboard | Gala" },
      { property: "og:description", content: "Multi-location event planning, credits and confirmations in one portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerDashboard,
});

function PlannerDashboard() {
  const { planner, events, locations } = usePlannerStore();
  const credits = plannerCredits();
  const upcoming = events.filter((e) => e.status === "upcoming");
  const confirmed = events.reduce((s, e) => s + e.confirmed, 0);
  const cities = new Set(locations.map((l) => l.city));

  return (
    <div>
      <SectionHeader
        title="Dashboard"
        subtitle={`${planner.company} · ${cities.size} cities`}
        action={
          <Link to="/planner/events/new" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            <Plus className="h-4 w-4" /> New event
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Upcoming events" value={upcoming.length} />
        <StatCard label="Saved locations" value={locations.length} hint={`${cities.size} cities`} />
        <StatCard label="Confirmed guests" value={confirmed.toLocaleString()} />
        <StatCard label="Credits available" value={credits.available.toLocaleString()} />
        <StatCard label="Credits allocated" value={credits.allocated.toLocaleString()} />
        <StatCard label="Credits used" value={credits.used.toLocaleString()} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Next up</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.slice(0, 4).map((e) => {
              const loc = resolveEventLocation(e);
              return (
                <Link key={e.id} to="/planner/events/$id" params={{ id: e.id }} className="block">
                  <EventCover cover={e.cover} className="h-44">
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-widest opacity-75">{format(new Date(e.date), "MMM d")} · {e.time}</p>
                        <span className="text-[10px] uppercase tracking-widest rounded-full border border-current/30 px-2 py-0.5 opacity-75">
                          {loc.kind === "saved" ? "Saved location" : "One-time"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif text-2xl leading-tight">{e.name}</h4>
                        <p className="mt-1 flex items-center gap-1.5 text-xs opacity-75">
                          <MapPin className="h-3 w-3" /> {loc.name} · {loc.city}
                        </p>
                      </div>
                    </div>
                  </EventCover>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Your locations</h3>
            <Link to="/planner/locations" className="text-xs text-muted-foreground hover:text-foreground">Manage</Link>
          </div>
          <div className="space-y-4">
            {locations.slice(0, 5).map((l) => (
              <Link key={l.id} to="/planner/locations/$id" params={{ id: l.id }} className="block">
                <p className="text-sm font-medium">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.city} · up to {l.capacity} guests</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
