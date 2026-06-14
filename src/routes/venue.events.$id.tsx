import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SectionHeader, StatCard, EventCover } from "@/components/gala/Primitives";
import { eventById, venueById, rsvpStats, organizers, events as allEvents } from "@/mock/data";
import { QRCode } from "@/components/gala/QRCode";
import { format } from "date-fns";
import { useState, useReducer } from "react";
import { cn } from "@/lib/utils";
import { Copy, RefreshCw, Pencil, Ban, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/venue/events/$id")({
  component: VenueEventDetail,
});

const TABS = ["Overview", "Credits", "Organizers", "Analytics"] as const;

function VenueEventDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const e = eventById(id);
  const v = e && venueById(e.venueId);
  const [tab, setTab] = useState<typeof TABS[number]>("Overview");
  const [pin, setPin] = useState(e?.scannerPin ?? "000000");
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  if (!e || !v) return null;
  const stats = rsvpStats(e.id);
  const isCancelled = (e.status as string) === "cancelled";

  const claimUrl = `https://gala.app/claim/${e.id}`;

  const doCancel = () => {
    (e as { status: string }).status = "cancelled";
    setCancelOpen(false);
    toast.success("Event cancelled");
    forceUpdate();
  };

  return (
    <div>
      <SectionHeader
        title={e.name}
        subtitle={`${v.name} · ${format(new Date(e.date), "MMMM d, yyyy")}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)} disabled={isCancelled}>
              <Pencil /> Edit event
            </Button>
            <Button
              variant="outline"
              className="text-rose-600 hover:text-rose-700"
              onClick={() => setCancelOpen(true)}
              disabled={isCancelled}
            >
              <Ban /> {isCancelled ? "Cancelled" : "Cancel event"}
            </Button>
          </div>
        }
      />

      <EventCover cover={e.cover} className="h-44 mb-6">
        <div className="flex h-full items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-75">{e.host}</p>
            <h2 className="font-serif text-3xl">{e.name}</h2>
          </div>
          <span className="text-[10px] uppercase tracking-widest rounded-full border border-current/30 px-2.5 py-1 opacity-75">{e.status}</span>
        </div>
      </EventCover>

      {isCancelled && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 flex items-center gap-3">
          <Ban className="h-4 w-4" />
          <span>This event has been cancelled. Invitees should be notified.</span>
          <Badge variant="secondary" className="ms-auto">Cancelled</Badge>
        </div>
      )}

      <div className="border-b mb-6">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors",
                tab === t ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Allocated" value={e.creditsTotal.toLocaleString()} />
            <StatCard label="Reserved" value={e.creditsReserved.toLocaleString()} />
            <StatCard label="Consumed" value={e.creditsConsumed.toLocaleString()} />
            <StatCard label="Show rate" value={`${Math.round((stats.checkedin/Math.max(stats.accepted,1))*100)}%`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Claim link</h3>
              <p className="text-sm text-muted-foreground mt-1">Share with organizers to let them claim this event.</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <QRCode value={claimUrl} size={140} />
                <div className="flex-1 min-w-0 space-y-3">
                  <code className="block rounded-lg bg-muted p-3 text-xs break-all">{claimUrl}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(claimUrl); toast.success("Copied"); }}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy link
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Scanner PIN</h3>
              <p className="text-sm text-muted-foreground mt-1">Use this at the door scanner app.</p>
              <div className="mt-4 flex items-center gap-3">
                <p className="font-serif text-5xl tracking-widest">{pin}</p>
                <button
                  onClick={() => { const np = String(Math.floor(100000 + Math.random()*900000)); setPin(np); toast.success("PIN regenerated"); }}
                  className="ms-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </button>
              </div>
              <Link to="/scanner" className="mt-4 inline-block text-xs text-muted-foreground underline">Open scanner →</Link>
            </div>
          </div>
        </div>
      )}

      {tab === "Credits" && (
        <div className="rounded-2xl border bg-card p-6 max-w-md">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Allocate more</h3>
          <p className="text-sm text-muted-foreground mb-4">Current allocation: <strong>{e.creditsTotal.toLocaleString()}</strong></p>
          <input type="number" defaultValue={500} className="w-full rounded-xl border bg-background px-4 py-3" />
          <button onClick={() => toast.success("Credits allocated")} className="mt-3 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background">Add credits</button>
        </div>
      )}

      {tab === "Organizers" && (
        <div className="rounded-2xl border bg-card overflow-hidden">
          {organizers.slice(0, 3).map(o => (
            <div key={o.id} className="flex items-center gap-4 p-4 border-b last:border-0">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted font-serif">{o.name[0]}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{o.name}</p>
                <p className="text-xs text-muted-foreground">{o.phone}</p>
              </div>
              <p className="text-xs text-muted-foreground">{o.events} events</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Analytics" && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Invited" value={stats.invited} />
          <StatCard label="Accepted" value={stats.accepted} />
          <StatCard label="Checked-in" value={stats.checkedin} />
        </div>
      )}

      <EditEventDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        event={e}
        onSaved={forceUpdate}
      />

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
            <AlertDialogDescription>
              {e.name} on {format(new Date(e.date), "MMMM d, yyyy")} will be marked as
              cancelled. Invitees should be notified separately. This action can't be undone in the prototype.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep event</AlertDialogCancel>
            <AlertDialogAction onClick={doCancel} className="bg-rose-600 hover:bg-rose-700">
              <Ban /> Cancel event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
      {false && <span onClick={() => navigate({ to: "/venue/events" })} />}
      {/* keep allEvents reference for tree-shaking safety */}
      <span className="hidden">{allEvents.length}</span>
    </div>
  );
}

function EditEventDialog({
  open, onOpenChange, event, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  event: ReturnType<typeof eventById> & {};
  onSaved: () => void;
}) {
  const [name, setName] = useState(event.name);
  const [host, setHost] = useState(event.host);
  const [date, setDate] = useState(event.date.slice(0, 10));
  const [address, setAddress] = useState(event.address);
  const [credits, setCredits] = useState(String(event.creditsTotal));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ev = event as unknown as Record<string, unknown>;
    ev.name = name.trim() || event.name;
    ev.host = host.trim() || event.host;
    ev.address = address.trim() || event.address;
    ev.date = new Date(date).toISOString();
    ev.creditsTotal = Number(credits) || event.creditsTotal;
    toast.success("Event updated");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
          <DialogDescription>Update event details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ev-name">Event name</Label>
            <Input id="ev-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-host">Host</Label>
            <Input id="ev-host" value={host} onChange={(e) => setHost(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-date">Date</Label>
            <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-addr">Address</Label>
            <Input id="ev-addr" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-credits">Credits allocated</Label>
            <Input id="ev-credits" type="number" min="0" value={credits} onChange={(e) => setCredits(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit"><Check /> Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
