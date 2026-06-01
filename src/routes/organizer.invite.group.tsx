import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { useState } from "react";
import { events } from "@/mock/data";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/invite/group")({
  component: Group,
});

function Group() {
  const [primary, setPrimary] = useState("Fahad Al-Otaibi");
  const [phone, setPhone] = useState("+966 55 111 2233");
  const [additional, setAdditional] = useState<string[]>(["Layla Al-Otaibi", "Sara Al-Otaibi"]);
  const nav = useNavigate();
  const cost = 1 + additional.length;

  return (
    <MobileShell showBack title="Group invite">
      <div className="px-5 pt-2 pb-8 space-y-5">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Event</label>
          <select className="w-full rounded-2xl border bg-card px-5 py-3.5">
            {events.filter(e => e.status === "upcoming").map(e => <option key={e.id}>{e.name}</option>)}
          </select>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Primary recipient</p>
          <input value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-2.5" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-2.5" />
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Additional guests</p>
            <span className="text-xs text-muted-foreground">{additional.length}</span>
          </div>
          {additional.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={a}
                onChange={(e) => { const n = [...additional]; n[i] = e.target.value; setAdditional(n); }}
                className="flex-1 rounded-xl border bg-background px-4 py-2.5"
              />
              <button onClick={() => setAdditional(additional.filter((_, j) => j !== i))} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setAdditional([...additional, ""])}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Add guest
          </button>
        </div>

        <div className="rounded-2xl bg-foreground text-background p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-background/60">Total cost</p>
            <p className="font-serif text-3xl mt-0.5">{cost} credits</p>
          </div>
          <button
            onClick={() => { toast.success(`Sent to ${1 + additional.length} guests`); nav({ to: "/organizer/invite/history" }); }}
            className="rounded-full bg-background text-foreground px-5 py-3 text-sm font-medium"
          >
            Send group
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
