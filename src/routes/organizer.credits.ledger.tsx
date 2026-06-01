import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { transactions, totalCredits } from "@/mock/data";
import { format } from "date-fns";

export const Route = createFileRoute("/organizer/credits/ledger")({
  component: Ledger,
});

function Ledger() {
  const c = totalCredits();
  let running = c.total;
  const rows = transactions.map(t => ({ ...t, running: (running = running - 0 + t.amount) }));
  return (
    <MobileShell showBack title="Credit ledger">
      <div className="px-5 pt-2 pb-8">
        <div className="rounded-3xl bg-foreground text-background p-5 mb-5">
          <p className="text-xs uppercase tracking-widest text-background/60">Current balance</p>
          <p className="font-serif text-4xl mt-1">{c.available.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border bg-card overflow-hidden">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3.5 border-b last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.description}</p>
                <p className="text-xs text-muted-foreground capitalize">{t.type} · {format(new Date(t.date), "MMM d")}</p>
              </div>
              <p className={`font-serif text-lg ${t.amount > 0 ? "text-success" : ""}`}>{t.amount > 0 ? "+" : ""}{t.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
