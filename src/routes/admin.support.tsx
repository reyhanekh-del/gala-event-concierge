import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/gala/Primitives";
import { guests, eventById } from "@/mock/data";
import { Search, RefreshCw, CreditCard, Ban, Activity } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/support")({
  component: Support,
});

function Support() {
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const matches = guests.filter(g => g.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  const g = pick ? guests.find(x => x.id === pick) : null;
  const e = g && eventById(g.eventId);

  return (
    <div>
      <SectionHeader title="Support tools" subtitle="Look up a guest or organizer" />
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border bg-card p-4">
          <div className="relative mb-3">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guest" className="w-full rounded-full border bg-background ps-10 pe-3 py-2 text-sm" />
          </div>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {matches.map(m => (
              <button
                key={m.id}
                onClick={() => setPick(m.id)}
                className={`w-full text-start rounded-xl px-3 py-2 text-sm hover:bg-muted ${pick === m.id ? "bg-muted" : ""}`}
              >
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.phone}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          {g && e ? (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Guest</p>
              <h2 className="font-serif text-3xl mt-1">{g.name}</h2>
              <p className="text-sm text-muted-foreground">{g.phone} · {e.name}</p>
              <p className="mt-2 text-xs uppercase tracking-widest">Status: <span className="font-medium">{g.status}</span></p>

              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <Action icon={RefreshCw} label="Resend invite" onClick={() => toast.success("Invite resent")} />
                <Action icon={CreditCard} label="Adjust credits" onClick={() => toast.success("Credits adjusted")} />
                <Action icon={Ban} label="Cancel invite" onClick={() => toast("Invite cancelled")} />
                <Action icon={Activity} label="View activity" onClick={() => toast("Loading activity…")} />
              </div>

              <div className="mt-6 rounded-xl bg-muted p-4 text-xs text-muted-foreground">
                Activity timeline (sample): Invited Mar 12 · Opened Mar 12 · Accepted Mar 13 · Pass generated Mar 13
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Search and select a guest to take action.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Action({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-xl border p-4 hover:bg-muted text-start">
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
