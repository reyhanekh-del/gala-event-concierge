import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SectionHeader, StatCard, EventCover } from "@/components/gala/Primitives";
import {
  usePlannerStore,
  getPlannerEvent,
  resolveEventLocation,
  updateEvent,
  saveOneTimeLocation,
  getPlannerState,
} from "@/mock/plannerStore";
import { format } from "date-fns";
import { useState } from "react";
import { Ban, Bookmark, Check, Copy, MapPin, Pencil } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/planner/events/$id")({
  head: () => ({
    meta: [
      { title: "Event details | Gala Event Planner" },
      { name: "description", content: "Event overview for planners: location, door PIN, confirmations and credit usage." },
      { property: "og:title", content: "Event details | Gala Event Planner" },
      { property: "og:description", content: "Location, door PIN, confirmations and credits for a planner event." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerEventDetail,
});

const TABS = ["Overview", "Location", "Credits"] as const;

function PlannerEventDetail() {
  const { id } = Route.useParams();
  usePlannerStore();
  const nav = useNavigate();
  const e = getPlannerEvent(id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [relocateOpen, setRelocateOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", host: "", date: "", time: "", guests: "" });

  if (!e) {
    return (
      <div>
        <SectionHeader title="Event not found" subtitle="It may have been removed." />
        <Button asChild variant="outline"><Link to="/planner/events">Back to events</Link></Button>
      </div>
    );
  }

  const loc = resolveEventLocation(e);
  const cancelled = e.status === "cancelled";
  const savedLocations = getPlannerState().locations;

  const openEdit = () => {
    setDraft({
      name: e.name,
      host: e.host,
      date: e.date.slice(0, 10),
      time: e.time,
      guests: String(e.expectedGuests),
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    updateEvent(e.id, {
      name: draft.name.trim() || e.name,
      host: draft.host.trim() || e.host,
      date: draft.date ? new Date(draft.date).toISOString() : e.date,
      time: draft.time || e.time,
      expectedGuests: Number(draft.guests) || e.expectedGuests,
    });
    setEditOpen(false);
    toast.success("Event updated");
  };

  return (
    <div>
      <SectionHeader
        title={e.name}
        subtitle={`${e.host} · ${format(new Date(e.date), "MMMM d, yyyy")} at ${e.time}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEdit} disabled={cancelled}><Pencil /> Edit event</Button>
            <Button variant="outline" className="text-rose-600 hover:text-rose-700" onClick={() => setCancelOpen(true)} disabled={cancelled}>
              <Ban /> {cancelled ? "Cancelled" : "Cancel event"}
            </Button>
          </div>
        }
      />

      {cancelled && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          This event is cancelled. Guests can no longer respond and the door scanner will reject its QR codes.
        </div>
      )}

      <EventCover cover={e.cover} className="h-44 mb-6">
        <div className="flex h-full items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-75">{e.host}</p>
            <h2 className="font-serif text-3xl">{e.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs opacity-75"><MapPin className="h-3 w-3" /> {loc.name} · {loc.city}</p>
          </div>
          <span className="rounded-full border border-current/30 px-2.5 py-1 text-[10px] uppercase tracking-widest opacity-75">{e.status}</span>
        </div>
      </EventCover>

      <div className="mb-6 flex gap-2 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors",
              tab === t ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
            <StatCard label="Expected guests" value={e.expectedGuests.toLocaleString()} />
            <StatCard label="Confirmed" value={e.confirmed.toLocaleString()} hint={e.expectedGuests ? `${Math.round((e.confirmed / e.expectedGuests) * 100)}% of expected` : undefined} />
            <StatCard label="Checked in" value={e.checkedIn.toLocaleString()} />
            <StatCard label="Credits used" value={`${e.creditsUsed} / ${e.creditsAllocated}`} />
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Scanner door PIN</h3>
            <p className="font-serif text-4xl tracking-[0.2em]">{e.scannerPin}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => { void navigator.clipboard?.writeText(e.scannerPin); toast.success("PIN copied"); }}
            >
              <Copy /> Copy PIN
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">Share with door staff to open the Gala scanner for this event.</p>
          </div>
        </div>
      )}

      {tab === "Location" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {loc.kind === "saved" ? "Saved location" : "One-time location"}
                </span>
                <h3 className="mt-3 font-serif text-2xl">{loc.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{loc.city}{loc.capacity ? ` · capacity ${loc.capacity.toLocaleString()}` : ""}</p>
                <p className="mt-3 flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> {loc.address}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${loc.name} ${loc.address}`)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-4 py-2 text-xs font-medium hover:bg-muted"
              >
                Open in Maps
              </a>
              {loc.kind === "saved" && loc.locationId && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/planner/locations/$id" params={{ id: loc.locationId }}>View location</Link>
                </Button>
              )}
              {loc.kind === "one-time" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { saveOneTimeLocation(e.id); toast.success("Added to your saved locations"); }}
                >
                  <Bookmark /> Save to my locations
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setRelocateOpen(true)} disabled={cancelled}>
                Move to another location
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">How locations work</h3>
            <p className="text-sm text-muted-foreground">
              As a planner you can run events anywhere. Saved locations are reusable across events; a one-time location belongs
              to this event only and never appears in your location book unless you save it.
            </p>
          </div>
        </div>
      )}

      {tab === "Credits" && (
        <div>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <StatCard label="Allocated" value={e.creditsAllocated.toLocaleString()} />
            <StatCard label="Used" value={e.creditsUsed.toLocaleString()} />
            <StatCard label="Remaining" value={(e.creditsAllocated - e.creditsUsed).toLocaleString()} />
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Allocation</h3>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${e.creditsAllocated ? Math.min(100, (e.creditsUsed / e.creditsAllocated) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Credits are consumed when invitations are delivered and returned automatically when an invitation expires.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/planner/credits">Go to credits</Link></Button>
          </div>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Event name</Label><Input value={draft.name} onChange={(ev) => setDraft({ ...draft, name: ev.target.value })} /></div>
            <div className="space-y-2"><Label>Host</Label><Input value={draft.host} onChange={(ev) => setDraft({ ...draft, host: ev.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={draft.date} onChange={(ev) => setDraft({ ...draft, date: ev.target.value })} /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={draft.time} onChange={(ev) => setDraft({ ...draft, time: ev.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Expected guests</Label><Input value={draft.guests} onChange={(ev) => setDraft({ ...draft, guests: ev.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={relocateOpen} onOpenChange={setRelocateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to another location</DialogTitle>
            <DialogDescription>Pick one of your saved locations for this event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {savedLocations.map((l) => {
              const active = loc.kind === "saved" && loc.locationId === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    updateEvent(e.id, { location: { kind: "saved", locationId: l.id } });
                    setRelocateOpen(false);
                    toast.success(`Moved to ${l.name}`);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-start transition-colors hover:bg-muted/40",
                    active && "border-foreground bg-muted/40",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.city} · capacity {l.capacity.toLocaleString()}</p>
                  </div>
                  {active && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
            <AlertDialogDescription>
              Guests will be told the event is cancelled and their QR codes stop working. Unused credits return to your balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep event</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                updateEvent(e.id, { status: "cancelled" });
                setCancelOpen(false);
                toast.success("Event cancelled");
                nav({ to: "/planner/events" });
              }}
            >
              Cancel event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
