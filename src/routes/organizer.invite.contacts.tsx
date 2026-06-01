import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { Search, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CONTACTS = [
  "Fahad Al-Otaibi", "Layla Hassan", "Mariam Al-Sabah", "Yousef Al-Mutairi",
  "Hessa Al-Maktoum", "Tariq Al-Khalifa", "Sara Al-Qasimi", "Abdullah Al-Rashid",
  "Reem Al-Faisal", "Omar Bin Sultan", "Fatima Al-Zahra", "Saif Al-Nahyan",
  "Aisha Al-Sabah", "Hamad Al-Thani", "Lulwa Al-Khalifa", "Nasser Al-Maktoum",
];

export const Route = createFileRoute("/organizer/invite/contacts")({
  component: Contacts,
});

function Contacts() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const nav = useNavigate();
  const list = CONTACTS.filter(c => c.toLowerCase().includes(q.toLowerCase()));

  return (
    <MobileShell
      showBack
      title="From contacts"
      right={
        <button
          disabled={sel.size === 0}
          onClick={() => { toast.success(`Inviting ${sel.size} contacts`); nav({ to: "/organizer/invite/history" }); }}
          className="text-sm font-medium disabled:text-muted-foreground"
        >
          Send ({sel.size})
        </button>
      }
    >
      <div className="px-5 pt-2 pb-4">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search contacts"
            className="w-full rounded-full border bg-card ps-11 pe-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
          />
        </div>
      </div>
      <div className="px-5 pb-8 space-y-1.5">
        {list.map((c) => {
          const checked = sel.has(c);
          return (
            <button
              key={c}
              onClick={() => {
                const n = new Set(sel);
                checked ? n.delete(c) : n.add(c);
                setSel(n);
              }}
              className="w-full flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-start hover:bg-muted transition-colors"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted font-serif">
                {c[0]}
              </span>
              <span className="flex-1 text-sm font-medium">{c}</span>
              <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${checked ? "bg-foreground border-foreground" : ""}`}>
                {checked && <Check className="h-3 w-3 text-background" />}
              </span>
            </button>
          );
        })}
      </div>
    </MobileShell>
  );
}
