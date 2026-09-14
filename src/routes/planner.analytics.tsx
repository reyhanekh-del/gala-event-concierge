import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { usePlannerStore, resolveEventLocation } from "@/mock/plannerStore";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/planner/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | Gala Event Planner" },
      { name: "description", content: "Compare confirmations, attendance and location performance across every planner event." },
      { property: "og:title", content: "Analytics | Gala Event Planner" },
      { property: "og:description", content: "Confirmations, attendance and per-location performance for planners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerAnalytics,
});

function PlannerAnalytics() {
  const { events, locations } = usePlannerStore();

  const perEvent = events.map((e) => ({
    name: e.name.split(" ").slice(0, 2).join(" "),
    confirmed: e.confirmed,
    arrived: e.checkedIn,
  }));

  const byCity = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      const city = resolveEventLocation(e).city;
      acc[city] = (acc[city] ?? 0) + e.confirmed;
      return acc;
    }, {}),
  ).map(([city, confirmed]) => ({ city, confirmed }));

  const past = events.filter((e) => e.status === "past");
  const showRate = past.length
    ? Math.round((past.reduce((s, e) => s + e.checkedIn, 0) / Math.max(1, past.reduce((s, e) => s + e.confirmed, 0))) * 100)
    : 0;
  const oneTime = events.filter((e) => e.location.kind === "one-time").length;

  return (
    <div>
      <SectionHeader title="Analytics" subtitle="Across all your events and locations" />

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Events" value={events.length} />
        <StatCard label="Confirmed guests" value={events.reduce((s, e) => s + e.confirmed, 0).toLocaleString()} />
        <StatCard label="Show rate" value={`${showRate}%`} hint="Past events" />
        <StatCard label="One-time locations" value={oneTime} hint={`${locations.length} saved`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Confirmed vs arrived</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={perEvent}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="confirmed" fill="var(--color-muted-foreground)" radius={6} />
                <Bar dataKey="arrived" fill="var(--color-foreground)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Guests by city</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={byCity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="city" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="confirmed" fill="var(--color-foreground)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
