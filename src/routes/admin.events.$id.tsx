import { createFileRoute, Link, useParams, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Pencil, Check, Users, Info, X, RefreshCw, Search, History,
  Send, Ban, Pencil as PencilIcon,
} from "lucide-react";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { eventById, venueById, guestsByEvent, type Guest, type RsvpStatus, type Event as EventT } from "@/mock/data";
import { format } from "date-fns";

const STATUS_VARIANT: Record<RsvpStatus, "default" | "secondary" | "destructive" | "outline"> = {
  accepted: "default",
  checkedin: "default",
  pending: "secondary",
  rejected: "destructive",
  expired: "outline",
  cancelled: "outline",
};

function AdminEventDetail() {
  const { id } = useParams({ from: "/admin/events/$id" });
  const router = useRouter();
  const base = eventById(id);
  const [event, setEvent] = useState<EventT | undefined>(base);
  const [guests, setGuests] = useState<Guest[]>(() => (base ? guestsByEvent(base.id) : []));
  const [editOpen, setEditOpen] = useState(false);
  const [query, setQuery] = useState("");

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Event not found</p>
        <Button variant="outline" onClick={() => router.history.back()}><ArrowLeft /> Back</Button>
      </div>
    );
  }

  const venue = venueById(event.venueId);
  const stats = useMemo(() => ({
    invited: guests.length,
    accepted: guests.filter((g) => g.status === "accepted" || g.status === "checkedin").length,
    pending: guests.filter((g) => g.status === "pending").length,
    rejected: guests.filter((g) => g.status === "rejected").length,
    cancelled: guests.filter((g) => g.status === "cancelled").length,
  }), [guests]);

  const filtered = guests.filter((g) =>
    !query.trim() ||
    g.name.toLowerCase().includes(query.toLowerCase()) ||
    g.phone.includes(query),
  );

  const cancelInvite = (gid: string) => {
    setGuests((arr) => arr.map((g) => g.id === gid ? { ...g, status: "cancelled" } : g));
    toast.success("Invite cancelled");
  };
  const resendInvite = (gid: string) => {
    setGuests((arr) => arr.map((g) => g.id === gid ? { ...g, status: "pending", invitedAt: new Date().toISOString() } : g));
    toast.success("Invite resent");
  };

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/admin/venues/$id" params={{ id: event.venueId }}>
          <ArrowLeft /> Back to venue
        </Link>
      </Button>

      <SectionHeader
        title={event.name}
        subtitle={`${venue?.name ?? "—"} · ${format(new Date(event.date), "MMM d, yyyy")}`}
        action={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil /> Edit event
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Invited" value={stats.invited} />
        <StatCard label="Accepted" value={stats.accepted} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Rejected" value={stats.rejected} />
        <StatCard label="Cancelled" value={stats.cancelled} />
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info"><Info className="h-4 w-4 mr-2" /> Details</TabsTrigger>
          <TabsTrigger value="invitees"><Users className="h-4 w-4 mr-2" /> Invitees</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="rounded-2xl border bg-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Event name" value={event.name} />
            <Field label="Arabic name" value={event.nameAr} />
            <Field label="Host" value={event.host} />
            <Field label="Venue" value={venue?.name ?? "—"} />
            <Field label="City" value={event.city} />
            <Field label="Address" value={event.address} />
            <Field label="Date" value={format(new Date(event.date), "PPP p")} />
            <Field label="Status" value={event.status} />
            <Field label="Scanner PIN" value={event.scannerPin} />
            <Field label="Credits total" value={event.creditsTotal.toLocaleString()} />
            <Field label="Credits reserved" value={event.creditsReserved.toLocaleString()} />
            <Field label="Credits consumed" value={event.creditsConsumed.toLocaleString()} />
          </div>
        </TabsContent>

        <TabsContent value="invitees" className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">{filtered.length} of {guests.length}</p>
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No invitees match.</div>
            ) : filtered.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-4 px-6 py-4 border-b last:border-0">
                <div className="min-w-0">
                  <p className="font-medium truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.phone} · {g.language.toUpperCase()}
                    {g.groupSize ? ` · group of ${g.groupSize}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={STATUS_VARIANT[g.status]} className="capitalize">{g.status}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resendInvite(g.id)}
                    disabled={g.status === "checkedin"}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Resend
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:text-rose-700"
                    onClick={() => cancelInvite(g.id)}
                    disabled={g.status === "cancelled" || g.status === "checkedin"}
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <EditEventDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        event={event}
        onSave={(patch) => setEvent((e) => e ? { ...e, ...patch } : e)}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="font-medium capitalize-first break-words">{value}</p>
    </div>
  );
}

function EditEventDialog({
  open, onOpenChange, event, onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  event: EventT;
  onSave: (patch: Partial<EventT>) => void;
}) {
  const [name, setName] = useState(event.name);
  const [host, setHost] = useState(event.host);
  const [city, setCity] = useState(event.city);
  const [address, setAddress] = useState(event.address);
  const [date, setDate] = useState(event.date.slice(0, 10));
  const [credits, setCredits] = useState(String(event.creditsTotal));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || event.name,
      host: host.trim() || event.host,
      city: city.trim() || event.city,
      address: address.trim() || event.address,
      date: new Date(date).toISOString(),
      creditsTotal: Number(credits) || 0,
    });
    toast.success("Event updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
          <DialogDescription>Update event information.</DialogDescription>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ev-city">City</Label>
              <Input id="ev-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-date">Date</Label>
              <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-addr">Address</Label>
            <Input id="ev-addr" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-credits">Credits total</Label>
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

export const Route = createFileRoute("/admin/events/$id")({
  component: AdminEventDetail,
});
