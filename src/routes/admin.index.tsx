import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { venues, organizers, events, monthlyRevenue } from "@/mock/data";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <SectionHeader title="Operations" subtitle="Platform-wide health" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Venues" value={venues.length} hint="3 active" />
        <StatCard label="Organizers" value={organizers.length} hint="2 onboarded today" />
        <StatCard label="Events" value={events.length} hint="3 upcoming" />
        <StatCard label="MRR" value="$58.9k" hint="+12% MoM" />
      </div>
      <div className="mt-8 rounded-2xl border bg-card p-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Platform revenue</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={monthlyRevenue()}>
              <defs>
                <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Area dataKey="value" stroke="var(--color-foreground)" fill="url(#a)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
