import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SectionHeader } from "@/components/gala/Primitives";
import { usePlannerStore, addEvent, addLocation, type PlannerEventLocation } from "@/mock/plannerStore";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/planner/events/new")({
  head: () => ({
    meta: [
      { title: "New Event | Gala Event Planner" },
      { name: "description", content: "Create an event at one of your saved locations, or use a one-time location without saving it." },
      { property: "og:title", content: "New Event | Gala Event Planner" },
      { property: "og:description", content: "Attach an event to a saved location or a one-time location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewPlannerEvent,
});

const COVERS = ["onyx", "pearl", "graphite", "smoke", "ivory", "ink"] as const;

function NewPlannerEvent() {
  const { locations } = usePlannerStore();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("20:00");
  const [guests, setGuests] = useState("");
  const [credits, setCredits] = useState("");
  const [cover, setCover] = useState<string>("onyx");

  const [mode, setMode] = useState<"saved" | "one-time">("saved");
  const [savedId, setSavedId] = useState<string>(locations[0]?.id ?? "");
  const [ot, setOt] = useState({ name: "", city: "", address: "", capacity: "" });
  const [alsoSave, setAlsoSave] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !host.trim() || !date) {
      toast.error("Event name, host and date are required");
      return;
    }

    let location: PlannerEventLocation;
    if (mode === "saved") {
      if (!savedId) {
        toast.error("Pick a saved location, or switch to a one-time location");
        return;
      }
      location = { kind: "saved", locationId: savedId };
    } else {
      if (!ot.name.trim() || !ot.city.trim() || !ot.address.trim()) {
        toast.error("One-time location needs a name, city and address");
        return;
      }
      if (alsoSave) {
        const saved = addLocation({
          name: ot.name.trim(),
          city: ot.city.trim(),
          address: ot.address.trim(),
          capacity: Number(ot.capacity) || Number(guests) || 0,
        });
        location = { kind: "saved", locationId: saved.id };
      } else {
        location = {
          kind: "one-time",
          name: ot.name.trim(),
          city: ot.city.trim(),
          address: ot.address.trim(),
          capacity: Number(ot.capacity) || undefined,
        };
      }
    }

    const created = addEvent({
      name: name.trim(),
      host: host.trim(),
      date: new Date(date).toISOString(),
      time,
      cover,
      expectedGuests: Number(guests) || 0,
      creditsAllocated: Number(credits) || 0,
      location,
    });

    toast.success(mode === "one-time" && !alsoSave ? "Event created with a one-time location" : "Event created");
    nav({ to: "/planner/events/$id", params: { id: created.id } });
  };

  return (
    <div className="max-w-3xl">
      <SectionHeader title="New event" subtitle="Plan an event at a saved location, or use a place just this once." />

      <form onSubmit={submit} className="space-y-10">
        <section className="space-y-5">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Basics</h3>
          <div className="space-y-2">
            <Label>Event name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Autumn Charity Gala" />
          </div>
          <div className="space-y-2">
            <Label>Host / client</Label>
            <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="Al-Saud Foundation" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Expected guests</Label><Input value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="240" /></div>
            <div className="space-y-2"><Label>Credits to allocate</Label><Input value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="300" /></div>
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Location</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You work across many places — reuse one you've saved, or add a location only for this event.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("saved")}
              className={cn(
                "rounded-2xl border p-4 text-start transition-colors",
                mode === "saved" ? "border-foreground bg-muted/40" : "hover:bg-muted/30",
              )}
            >
              <p className="text-sm font-medium">Saved location</p>
              <p className="mt-1 text-xs text-muted-foreground">Pick from your {locations.length} saved locations.</p>
            </button>
            <button
              type="button"
              onClick={() => setMode("one-time")}
              className={cn(
                "rounded-2xl border p-4 text-start transition-colors",
                mode === "one-time" ? "border-foreground bg-muted/40" : "hover:bg-muted/30",
              )}
            >
              <p className="text-sm font-medium">One-time location</p>
              <p className="mt-1 text-xs text-muted-foreground">Used for this event only — not added to your account.</p>
            </button>
          </div>

          {mode === "saved" && (
            <div className="space-y-2">
              {locations.length === 0 && (
                <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  No saved locations yet. Switch to a one-time location, or save one from the Locations page.
                </p>
              )}
              {locations.map((l) => {
                const active = savedId === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSavedId(l.id)}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-start transition-colors",
                      active ? "border-foreground bg-muted/40" : "hover:bg-muted/30",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{l.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {l.city} · capacity {l.capacity.toLocaleString()}
                      </p>
                    </div>
                    {active && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {mode === "one-time" && (
            <div className="space-y-4 rounded-2xl border p-5">
              <div className="space-y-2">
                <Label>Location name</Label>
                <Input value={ot.name} onChange={(e) => setOt({ ...ot, name: e.target.value })} placeholder="Nefud Dune Camp" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>City</Label><Input value={ot.city} onChange={(e) => setOt({ ...ot, city: e.target.value })} placeholder="Al-Ula" /></div>
                <div className="space-y-2"><Label>Capacity (optional)</Label><Input value={ot.capacity} onChange={(e) => setOt({ ...ot, capacity: e.target.value })} placeholder="100" /></div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea rows={2} value={ot.address} onChange={(e) => setOt({ ...ot, address: e.target.value })} placeholder="Access road, district, city" />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/40 p-4">
                <div>
                  <p className="text-sm font-medium">Also save to my locations</p>
                  <p className="text-xs text-muted-foreground">Off by default — the location stays with this event only.</p>
                </div>
                <Switch checked={alsoSave} onCheckedChange={setAlsoSave} />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Cover</h3>
          <div className="grid grid-cols-6 gap-3 max-w-md">
            {COVERS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCover(c)}
                aria-label={c}
                className={cn("aspect-square rounded-xl bg-gradient-to-br", gradFor(c), cover === c && "ring-2 ring-foreground ring-offset-2")}
              />
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <Button type="submit" className="rounded-full px-6">Create event</Button>
          <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => nav({ to: "/planner/events" })}>Cancel</Button>
        </div>
      </form>
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
