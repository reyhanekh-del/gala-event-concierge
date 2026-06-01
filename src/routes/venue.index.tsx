import { createFileRoute, Link } from "@tanstack/react-router";
import { StatCard, SectionHeader, EventCover } from "@/components/gala/Primitives";
import { events, venues, monthlyRevenue } from "@/mock/data";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/venue/")({
  component: VenueDashboard,
});

function VenueDashboard() {
  const v = venues[0];
  const upcoming = events.filter(e => e.status === "upcoming");
  return (
    <div>
      <SectionHeader
        title="Dashboard"
        subtitle={`${v.name} · ${v.city}`}
        action={
          <Link to="/venue/events/new" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            <Plus className="h-4 w-4" /> New event
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Credits purchased" value={v.creditsPurchased.toLocaleString()} />
        <StatCard label="Credits allocated" value={v.creditsAllocated.toLocaleString()} hint={`${Math.round(v.creditsAllocated/v.creditsPurchased*100)}% used`} />
        <StatCard label="Active events" value="3" />
        <StatCard label="Upcoming" value={upcoming.length} />
        <StatCard label="Show rate" value="87%" hint="vs 82% last month" />
        <StatCard label="Revenue YTD" value={`$${(v.revenue/1000).toFixed(0)}k`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Monthly revenue</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={monthlyRevenue()}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Area dataKey="value" stroke="var(--color-foreground)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Upcoming events</h3>
          <div className="space-y-3">
            {upcoming.slice(0, 3).map(e => (
              <Link key={e.id} to="/venue/events/$id" params={{ id: e.id }}>
                <EventCover cover={e.cover} className="h-24 mb-3">
                  <div className="flex h-full flex-col justify-between">
                    <p className="text-[10px] uppercase tracking-widest opacity-75">{format(new Date(e.date), "MMM d")}</p>
                    <p className="font-serif text-base leading-tight">{e.name}</p>
                  </div>
                </EventCover>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
