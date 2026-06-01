import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { monthlyRevenue } from "@/mock/data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/revenue")({
  component: () => (
    <div>
      <SectionHeader title="Revenue" subtitle="Platform-wide" />
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="YTD" value="$447k" />
        <StatCard label="This month" value="$58.9k" />
        <StatCard label="Top venue" value="Ritz Riyadh" />
        <StatCard label="ARPU" value="$2,180" />
      </div>
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Monthly</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={monthlyRevenue()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" fill="var(--color-foreground)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  ),
});
