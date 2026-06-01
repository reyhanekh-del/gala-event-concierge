import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/gala/Primitives";
import { venues } from "@/mock/data";

export const Route = createFileRoute("/admin/venues")({
  component: () => (
    <div>
      <SectionHeader title="Venues" subtitle={`${venues.length} on the platform`} />
      <div className="rounded-2xl border bg-card overflow-hidden">
        {venues.map(v => (
          <div key={v.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0">
            <div>
              <p className="font-medium">{v.name}</p>
              <p className="text-xs text-muted-foreground">{v.city}</p>
            </div>
            <div className="flex gap-8 text-sm">
              <div className="text-end"><p className="text-xs text-muted-foreground">Credits</p><p className="font-medium">{v.creditsPurchased.toLocaleString()}</p></div>
              <div className="text-end"><p className="text-xs text-muted-foreground">Revenue</p><p className="font-medium">${(v.revenue/1000).toFixed(0)}k</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});
