import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { transactions } from "@/mock/data";
import { format } from "date-fns";

export const Route = createFileRoute("/organizer/transactions")({
  component: TX,
});

function TX() {
  return (
    <MobileShell showBack title="Transactions">
      <div className="px-5 pt-2 pb-8 space-y-2">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{t.description}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM d, yyyy")} · <span className="capitalize">{t.type}</span></p>
            </div>
            <p className={`font-serif text-lg ${t.amount > 0 ? "text-success" : ""}`}>{t.amount > 0 ? "+" : ""}{t.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
