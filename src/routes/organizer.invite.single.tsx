import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { useState } from "react";
import { events } from "@/mock/data";
import { toast } from "sonner";
import { MessageCircle, X } from "lucide-react";

export const Route = createFileRoute("/organizer/invite/single")({
  component: Single,
});

function Single() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+966 ");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [eventId, setEventId] = useState(events[0].id);
  const [preview, setPreview] = useState(false);
  const nav = useNavigate();

  return (
    <MobileShell showBack title="Single invite">
      <div className="px-5 pt-2 pb-8 space-y-5">
        <Select label="Event" value={eventId} onChange={setEventId} options={events.filter(e => e.status === "upcoming").map(e => ({ value: e.id, label: e.name }))} />
        <Input label="Guest name" value={name} onChange={setName} placeholder="Fahad Al-Otaibi" />
        <Input label="Phone" value={phone} onChange={setPhone} placeholder="+966 55 000 0000" />
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Language</label>
          <div className="grid grid-cols-2 gap-2">
            {(["en", "ar"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-2xl border py-3 text-sm font-medium ${lang === l ? "bg-foreground text-background border-foreground" : ""}`}
              >
                {l === "en" ? "English" : "العربية"}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-muted p-4 text-sm flex items-center justify-between">
          <span className="text-muted-foreground">Cost</span>
          <span className="font-medium">1 credit</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPreview(true)}
            className="rounded-full border py-3.5 text-sm font-medium"
          >
            Preview WhatsApp
          </button>
          <button
            onClick={() => { toast.success("Invite sent"); nav({ to: "/organizer/invite/history" }); }}
            className="rounded-full bg-foreground py-3.5 text-sm font-medium text-background"
          >
            Send invite
          </button>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4" onClick={() => setPreview(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-background p-5 shadow-elegant" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"><MessageCircle className="h-3.5 w-3.5" /></span>
                <span className="text-sm font-medium">WhatsApp preview</span>
              </div>
              <button onClick={() => setPreview(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 text-sm">
              <p className="font-medium">{name || "Dear guest"},</p>
              <p className="mt-1.5 text-muted-foreground">
                You're cordially invited to <span className="font-medium text-foreground">{events.find(e => e.id === eventId)?.name}</span>.
              </p>
              <p className="mt-2 text-muted-foreground">Tap to RSVP: gala.app/invite/...</p>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border bg-card px-5 py-3.5 outline-none focus:ring-2 focus:ring-foreground/10" />
    </div>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border bg-card px-5 py-3.5 outline-none focus:ring-2 focus:ring-foreground/10">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
