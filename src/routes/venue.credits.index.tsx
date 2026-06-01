import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { venues, events, creditPackages } from "@/mock/data";

export const Route = createFileRoute("/venue/credits/")({
  component: VenueCredits,
});

function VenueCredits() {
  const v = venues[0];
  return (
    <div>
      <SectionHeader
        title="Credits"
        subtitle="Manage your venue's credit pool"
        action={<Link to="/venue/credits/buy" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Buy credits</Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total purchased" value={v.creditsPurchased.toLocaleString()} />
        <StatCard label="Allocated" value={v.creditsAllocated.toLocaleString()} />
        <StatCard label="Available" value={(v.creditsPurchased - v.creditsAllocated).toLocaleString()} />
      </div>

      <div className="mt-8 rounded-2xl border bg-card overflow-hidden">
        <div className="px-6 py-4 text-xs uppercase tracking-widest text-muted-foreground border-b">Allocation by event</div>
        {events.map(e => (
          <div key={e.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">{e.name}</p>
              <p className="text-xs text-muted-foreground">{e.host}</p>
            </div>
            <p className="font-serif text-lg">{e.creditsTotal.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
