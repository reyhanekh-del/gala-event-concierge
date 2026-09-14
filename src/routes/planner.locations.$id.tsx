import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { usePlannerStore, getPlannerLocation, eventsAtLocation, updateLocation } from "@/mock/plannerStore";
import { format } from "date-fns";
import { useState } from "react";
import { MapPin, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/planner/locations/$id")({
  head: () => ({
    meta: [
      { title: "Location details | Gala Event Planner" },
      { name: "description", content: "Review a saved planner location, its capacity and every event scheduled there." },
      { property: "og:title", content: "Location details | Gala Event Planner" },
      { property: "og:description", content: "Capacity, address and event history for a saved planner location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LocationDetail,
});

function LocationDetail() {
  const { id } = Route.useParams();
  usePlannerStore();
  const l = getPlannerLocation(id);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", city: "", address: "", capacity: "", notes: "" });

  if (!l) {
    return (
      <div>
        <SectionHeader title="Location not found" subtitle="It may have been removed." />
        <Button asChild variant="outline"><Link to="/planner/locations">Back to locations</Link></Button>
      </div>
    );
  }

  const evts = eventsAtLocation(l.id);
  const openEdit = () => {
    setDraft({ name: l.name, city: l.city, address: l.address, capacity: String(l.capacity), notes: l.notes ?? "" });
    setOpen(true);
  };

  const save = () => {
    updateLocation(l.id, {
      name: draft.name.trim() || l.name,
      city: draft.city.trim() || l.city,
      address: draft.address.trim() || l.address,
      capacity: Number(draft.capacity) || l.capacity,
      notes: draft.notes.trim() || undefined,
    });
    setOpen(false);
    toast.success("Location updated");
  };

  return (
    <div>
      <SectionHeader
        title={l.name}
        subtitle={`${l.city} · saved ${format(new Date(l.createdAt), "MMM d, yyyy")}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEdit}><Pencil /> Edit</Button>
            <Button asChild className="rounded-full"><Link to="/planner/events/new"><Plus /> New event here</Link></Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard label="Capacity" value={l.capacity.toLocaleString()} />
        <StatCard label="Events scheduled" value={evts.length} />
        <StatCard label="Guests confirmed here" value={evts.reduce((s, e) => s + e.confirmed, 0).toLocaleString()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Address</h3>
          <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> {l.address}</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${l.name} ${l.address}`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-full border px-4 py-2 text-xs font-medium hover:bg-muted"
          >
            Open in Maps
          </a>
          {l.notes && (
            <>
              <h3 className="mt-6 text-xs uppercase tracking-widest text-muted-foreground mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{l.notes}</p>
            </>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl border bg-card overflow-hidden">
          <div className="border-b px-6 py-4 text-xs uppercase tracking-widest text-muted-foreground">Events at this location</div>
          {evts.length === 0 && <p className="px-6 py-6 text-sm text-muted-foreground">No events scheduled here yet.</p>}
          {evts.map((e) => (
            <Link
              key={e.id}
              to="/planner/events/$id"
              params={{ id: e.id }}
              className="flex items-center justify-between border-b px-6 py-4 last:border-0 hover:bg-muted/40"
            >
              <div>
                <p className="text-sm font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.host} · {format(new Date(e.date), "MMM d, yyyy")} at {e.time}</p>
              </div>
              <div className="text-end">
                <p className="font-serif text-lg leading-none">{e.confirmed}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">confirmed</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit location</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>City</Label><Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></div>
              <div className="space-y-2"><Label>Capacity</Label><Input value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
