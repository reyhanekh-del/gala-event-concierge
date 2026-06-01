import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { events } from "@/mock/data";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/delegation/allocate")({
  component: Allocate,
});

function Allocate() {
  const [amount, setAmount] = useState(150);
  const nav = useNavigate();
  return (
    <MobileShell showBack title="Allocate credits">
      <div className="px-5 pt-2 pb-8 space-y-5">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Co-inviter name</label>
          <input defaultValue="Huda Al-Salem" className="w-full rounded-2xl border bg-card px-5 py-3.5" />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone</label>
          <input defaultValue="+966 56 332 1100" className="w-full rounded-2xl border bg-card px-5 py-3.5" />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Event</label>
          <select className="w-full rounded-2xl border bg-card px-5 py-3.5">
            {events.filter(e => e.status === "upcoming").map(e => <option key={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="rounded-3xl bg-foreground text-background p-5">
          <p className="text-xs uppercase tracking-widest text-background/60">Credits to allocate</p>
          <p className="font-serif text-5xl mt-1">{amount}</p>
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
            className="w-full mt-4 accent-background"
          />
        </div>
        <button
          onClick={() => { toast.success("Co-inviter added"); nav({ to: "/organizer/delegation" }); }}
          className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
        >
          Allocate
        </button>
      </div>
    </MobileShell>
  );
}
