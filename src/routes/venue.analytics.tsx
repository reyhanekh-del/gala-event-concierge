import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { events, rsvpStats, responseTimeHist } from "@/mock/data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/venue/analytics")({
  component: VenueAnalytics,
});

function VenueAnalytics() {
  const attendance = events.map(e => {
    const s = rsvpStats(e.id);
    return { name: e.name.split(" ").slice(0, 2).join(" "), expected: s.accepted, arrived: s.checkedin };
  });

  return (
    <div>
      <SectionHeader title="Analytics" subtitle="Across all events" />
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Avg show rate" value="87%" />
        <StatCard label="Avg RSVP time" value="4.2 h" />
        <StatCard label="Total guests" value="2,184" />
        <StatCard label="No-shows" value="284" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Expected vs arrived</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={attendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="expected" fill="var(--color-muted-foreground)" radius={6} />
                <Bar dataKey="arrived" fill="var(--color-foreground)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Response time (invite → RSVP)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={responseTimeHist()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="bucket" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" fill="var(--color-foreground)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
