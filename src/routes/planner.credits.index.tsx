import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { usePlannerStore, plannerCredits, resolveEventLocation } from "@/mock/plannerStore";
import { format } from "date-fns";

export const Route = createFileRoute("/planner/credits/")({
  head: () => ({
    meta: [
      { title: "Credits | Gala Event Planner" },
      { name: "description", content: "Track your planner credit balance, allocations per event and every credit movement." },
      { property: "og:title", content: "Credits | Gala Event Planner" },
      { property: "og:description", content: "Planner credit balance, allocation per event and ledger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerCredits,
});

export default function noop() {}

function PlannerCredits() {
  const { events, transactions } = usePlannerStore();
  const c = plannerCredits();

  return (
    <div>
      <SectionHeader
        title="Credits"
        subtitle="One shared pool across all your locations and events"
        action={
          <Link to="/venue/credits/buy" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            Buy credits
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Purchased" value={c.purchased.toLocaleString()} />
        <StatCard label="Allocated" value={c.allocated.toLocaleString()} />
        <StatCard label="Used" value={c.used.toLocaleString()} />
        <StatCard label="Available" value={c.available.toLocaleString()} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="border-b px-6 py-4 text-xs uppercase tracking-widest text-muted-foreground">Allocation by event</div>
          {events.map((e) => {
            const loc = resolveEventLocation(e);
            return (
              <Link
                key={e.id}
                to="/planner/events/$id"
                params={{ id: e.id }}
                className="flex items-center justify-between border-b px-6 py-4 last:border-0 hover:bg-muted/40"
              >
                <div>
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{loc.name} · {loc.city}</p>
                </div>
                <p className="font-serif text-lg">{e.creditsAllocated.toLocaleString()}</p>
              </Link>
            );
          })}
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="border-b px-6 py-4 text-xs uppercase tracking-widest text-muted-foreground">Ledger</div>
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between border-b px-6 py-4 last:border-0">
              <div>
                <p className="text-sm font-medium">{t.description}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{t.type} · {format(new Date(t.date), "MMM d, yyyy")}</p>
              </div>
              <p className={t.amount > 0 ? "font-serif text-lg text-emerald-600" : "font-serif text-lg"}>
                {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
