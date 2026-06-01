import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/events/new")({
  component: NewEvent,
});

function NewEvent() {
  const [step, setStep] = useState(1);
  const nav = useNavigate();

  return (
    <MobileShell showBack title={`Create event · ${step}/3`}>
      <div className="px-5 pt-2 pb-8">
        <div className="flex gap-1.5 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-foreground" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl">Basics</h2>
            <Field label="Event name" defaultValue="An evening at the gardens" />
            <Field label="Host" defaultValue="Al-Saud Family" />
            <Field label="Description" textarea />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl">Venue & timing</h2>
            <Field label="Venue" defaultValue="The Ritz-Carlton Riyadh" />
            <Field label="Date" defaultValue="2026-07-12" />
            <Field label="Time" defaultValue="20:00" />
            <Field label="Expected guests" defaultValue="180" />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl">Branding</h2>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Cover</p>
              <div className="grid grid-cols-3 gap-3">
                {["onyx", "pearl", "graphite", "smoke", "ivory", "ink"].map((c) => (
                  <div key={c} className={`aspect-square rounded-2xl bg-gradient-to-br ${c === "onyx" ? "ring-2 ring-foreground" : ""} ${gradFor(c)}`} />
                ))}
              </div>
            </div>
            <Field label="Dress code" defaultValue="Black tie" />
          </div>
        )}

        <button
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else { toast.success("Event created"); nav({ to: "/organizer/events" }); }
          }}
          className="mt-10 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
        >
          {step < 3 ? "Continue" : "Create event"}
        </button>
      </div>
    </MobileShell>
  );
}

function Field({ label, defaultValue, textarea }: { label: string; defaultValue?: string; textarea?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          defaultValue={defaultValue}
          rows={3}
          className="w-full rounded-2xl border bg-card px-5 py-3.5 outline-none focus:ring-2 focus:ring-foreground/10"
        />
      ) : (
        <input
          defaultValue={defaultValue}
          className="w-full rounded-2xl border bg-card px-5 py-3.5 outline-none focus:ring-2 focus:ring-foreground/10"
        />
      )}
    </div>
  );
}

function gradFor(c: string) {
  const map: Record<string, string> = {
    onyx: "from-zinc-900 to-zinc-700",
    pearl: "from-zinc-200 to-white",
    graphite: "from-zinc-800 to-zinc-600",
    smoke: "from-zinc-700 to-zinc-500",
    ivory: "from-stone-100 to-stone-300",
    ink: "from-black to-zinc-800",
  };
  return map[c];
}
