import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { monthlyRevenue, venues } from "@/mock/data";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/venue/revenue")({
  component: VenueRevenue,
});

function VenueRevenue() {
  const v = venues[0];
  return (
    <div>
      <SectionHeader title="Revenue" subtitle="Monthly credit sales" />
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="YTD revenue" value={`$${(v.revenue/1000).toFixed(0)}k`} />
        <StatCard label="This month" value="$58.9k" hint="+12% vs last" />
        <StatCard label="Avg deal" value="$412" />
        <StatCard label="Orders" value="143" />
      </div>
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Monthly</h3>
        <div className="h-80">
          <ResponsiveContainer>
            <LineChart data={monthlyRevenue()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Line dataKey="value" stroke="var(--color-foreground)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-foreground)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
