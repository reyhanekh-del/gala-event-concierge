import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Building2, Users, Wallet, CalendarDays, Pencil, UserPlus, Check } from "lucide-react";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useVenuesStore, getVenueManagers, getVenueTransactions, getVenueOrganizers, getVenueEvents,
  updateVenue, addVenueManager, type VenueManager,
} from "@/mock/venueStore";

function VenueDetailPage() {
  const { id } = useParams({ from: "/admin/venues/$id" });
  const { venues } = useVenuesStore();
  const venue = venues.find((v) => v.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  if (!venue) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Venue not found</p>
        <Button asChild variant="outline">
          <Link to="/admin/venues"><ArrowLeft /> Back to venues</Link>
        </Button>
      </div>
    );
  }

  const managers = getVenueManagers(venue.id);
  const txs = getVenueTransactions(venue.id);
  const orgs = getVenueOrganizers(venue.id);
  const events = getVenueEvents(venue.id);
  const available = venue.creditsPurchased - venue.creditsAllocated;

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/admin/venues"><ArrowLeft /> Venues</Link>
      </Button>

      <SectionHeader
        title={venue.name}
        subtitle={venue.city}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setUserOpen(true)}>
              <UserPlus /> Define user
            </Button>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil /> Edit venue
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Credits purchased" value={venue.creditsPurchased.toLocaleString()} icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Credits allocated" value={venue.creditsAllocated.toLocaleString()} hint={`${available.toLocaleString()} available`} />
        <StatCard label="Revenue" value={`$${(venue.revenue / 1000).toFixed(1)}k`} />
        <StatCard label="Events" value={events.length} icon={<CalendarDays className="h-4 w-4" />} />
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info"><Building2 className="h-4 w-4 mr-2" /> Info</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" /> Users</TabsTrigger>
          <TabsTrigger value="credits"><Wallet className="h-4 w-4 mr-2" /> Credit history</TabsTrigger>
          <TabsTrigger value="events"><CalendarDays className="h-4 w-4 mr-2" /> Events</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="rounded-2xl border bg-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Venue ID" value={venue.id} />
            <Field label="Name" value={venue.name} />
            <Field label="City" value={venue.city} />
            <Field label="Credits purchased" value={venue.creditsPurchased.toLocaleString()} />
            <Field label="Credits allocated" value={venue.creditsAllocated.toLocaleString()} />
            <Field label="Credits available" value={available.toLocaleString()} />
            <Field label="Total revenue" value={`$${venue.revenue.toLocaleString()}`} />
            <Field label="Organizers" value={`${orgs.length} active`} />
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="rounded-2xl border bg-card overflow-hidden">
            {managers.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No users defined yet.
              </div>
            ) : managers.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.email} · {m.phone}</p>
                </div>
                <Badge variant="secondary">{m.role}</Badge>
              </div>
            ))}
          </div>
          {orgs.length > 0 && (
            <>
              <h3 className="font-serif text-xl mt-8 mb-3">Linked organizers</h3>
              <div className="rounded-2xl border bg-card overflow-hidden">
                {orgs.map((o) => (
                  <div key={o.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0">
                    <div>
                      <p className="font-medium">{o.name}</p>
                      <p className="text-xs text-muted-foreground">{o.phone}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{o.events} events</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="credits" className="mt-6">
          <div className="rounded-2xl border bg-card overflow-hidden">
            {txs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No transactions yet.
              </div>
            ) : txs.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0">
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.date).toLocaleDateString()} · {t.type}
                  </p>
                </div>
                <p className={`font-medium ${t.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.amount >= 0 ? "+" : ""}{t.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="rounded-2xl border bg-card overflow-hidden">
            {events.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No events for this venue yet.
              </div>
            ) : events.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0">
                <div>
                  <p className="font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.date).toLocaleDateString()} · {e.host}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-end">
                    <p className="text-xs text-muted-foreground">Credits</p>
                    <p className="font-medium">{e.creditsConsumed} / {e.creditsTotal}</p>
                  </div>
                  <Badge variant={e.status === "upcoming" ? "default" : "secondary"} className="capitalize">
                    {e.status}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/events/$id" params={{ id: e.id }}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <EditVenueDialog open={editOpen} onOpenChange={setEditOpen} venue={venue} />
      <DefineUserDialog open={userOpen} onOpenChange={setUserOpen} venueId={venue.id} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function EditVenueDialog({
  open, onOpenChange, venue,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  venue: ReturnType<typeof useVenuesStore>["venues"][number];
}) {
  const [name, setName] = useState(venue.name);
  const [city, setCity] = useState(venue.city);
  const [credits, setCredits] = useState(String(venue.creditsPurchased));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVenue(venue.id, {
      name: name.trim() || venue.name,
      city: city.trim() || venue.city,
      creditsPurchased: Number(credits) || 0,
    });
    toast.success("Venue updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit venue</DialogTitle>
          <DialogDescription>Update venue details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="e-name">Venue name</Label>
            <Input id="e-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-city">City</Label>
            <Input id="e-city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-credits">Credits purchased</Label>
            <Input id="e-credits" type="number" min="0" value={credits} onChange={(e) => setCredits(e.target.value)} />
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

function DefineUserDialog({
  open, onOpenChange, venueId,
}: { open: boolean; onOpenChange: (o: boolean) => void; venueId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<VenueManager["role"]>("Manager");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    addVenueManager(venueId, {
      id: `m_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
    });
    toast.success(`${name} added to venue`);
    setName(""); setEmail(""); setPhone(""); setRole("Manager");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Define venue user</DialogTitle>
          <DialogDescription>Assign someone to manage this venue.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="u-name">Full name</Label>
            <Input id="u-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="u-email">Email</Label>
            <Input id="u-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="u-phone">Phone</Label>
            <Input id="u-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 50 000 0000" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as VenueManager["role"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Coordinator">Coordinator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit"><UserPlus /> Add user</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/admin/venues/$id")({
  component: VenueDetailPage,
});
