import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import {
  usePlannerStore,
  addLocation,
  updateLocation,
  removeLocation,
  eventsAtLocation,
  type PlannerLocation,
} from "@/mock/plannerStore";
import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/planner/locations/")({
  head: () => ({
    meta: [
      { title: "Saved Locations | Gala Event Planner" },
      { name: "description", content: "Save the locations you work with, reuse them across events, or attach a one-time location to a single event." },
      { property: "og:title", content: "Saved Locations | Gala Event Planner" },
      { property: "og:description", content: "Reusable location book for planners working across multiple venues." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerLocations,
});

type Draft = { name: string; city: string; address: string; capacity: string; notes: string };
const empty: Draft = { name: "", city: "", address: "", capacity: "", notes: "" };

function PlannerLocations() {
  const { locations } = usePlannerStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlannerLocation | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);

  const cities = new Set(locations.map((l) => l.city));
  const totalCapacity = locations.reduce((s, l) => s + l.capacity, 0);

  const openNew = () => { setEditing(null); setDraft(empty); setOpen(true); };
  const openEdit = (l: PlannerLocation) => {
    setEditing(l);
    setDraft({ name: l.name, city: l.city, address: l.address, capacity: String(l.capacity), notes: l.notes ?? "" });
    setOpen(true);
  };

  const submit = () => {
    if (!draft.name.trim() || !draft.city.trim() || !draft.address.trim()) {
      toast.error("Name, city and address are required");
      return;
    }
    const payload = {
      name: draft.name.trim(),
      city: draft.city.trim(),
      address: draft.address.trim(),
      capacity: Number(draft.capacity) || 0,
      notes: draft.notes.trim() || undefined,
    };
    if (editing) {
      updateLocation(editing.id, payload);
      toast.success("Location updated");
    } else {
      addLocation(payload);
      toast.success("Location saved");
    }
    setOpen(false);
  };

  const del = (l: PlannerLocation) => {
    if (!removeLocation(l.id)) {
      toast.error("This location is used by an event and can't be removed");
      return;
    }
    toast.success("Location removed");
  };

  return (
    <div>
      <SectionHeader
        title="Locations"
        subtitle="Save the places you work with, then reuse them when creating events."
        action={<Button className="rounded-full" onClick={openNew}><Plus /> Add location</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard label="Saved locations" value={locations.length} />
        <StatCard label="Cities" value={cities.size} hint={[...cities].join(" · ")} />
        <StatCard label="Combined capacity" value={totalCapacity.toLocaleString()} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {locations.map((l) => {
          const used = eventsAtLocation(l.id).length;
          return (
            <div key={l.id} className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to="/planner/locations/$id" params={{ id: l.id }} className="font-serif text-xl leading-tight hover:underline">
                    {l.name}
                  </Link>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {l.city}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {used} {used === 1 ? "event" : "events"}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{l.address}</p>
              <p className="mt-2 text-xs text-muted-foreground">Capacity {l.capacity.toLocaleString()}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(l)}><Pencil /> Edit</Button>
                <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700" onClick={() => del(l)}>
                  <Trash2 /> Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit location" : "Add location"}</DialogTitle>
            <DialogDescription>
              Saved locations can be attached to any future event. For a place you'll only use once, add it directly while creating the event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Location name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Grand Ballroom, Ritz-Carlton" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="Riyadh" />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: e.target.value })} placeholder="400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Street, district, city" />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Access, parking, curfew…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save changes" : "Save location"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
