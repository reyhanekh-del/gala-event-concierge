import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays, User, Building2, Mail, Phone } from "lucide-react";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { organizers, events, venueById, rsvpStats } from "@/mock/data";

function OrganizerDetailPage() {
  const { id } = useParams({ from: "/admin/organizers/$id" });
  const organizer = organizers.find((o) => o.id === id);

  if (!organizer) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Organizer not found</p>
        <Button asChild variant="outline">
          <Link to="/admin/organizers"><ArrowLeft /> Back to organizers</Link>
        </Button>
      </div>
    );
  }

  const orgEvents = events.filter((e) => e.organizerId === organizer.id);
  const venue = organizer.venueId ? venueById(organizer.venueId) : undefined;
  const upcoming = orgEvents.filter((e) => e.status === "upcoming").length;
  const past = orgEvents.filter((e) => e.status === "past").length;
  const totalCredits = orgEvents.reduce((sum, e) => sum + e.creditsTotal, 0);

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/admin/organizers"><ArrowLeft /> Organizers</Link>
      </Button>

      <SectionHeader title={organizer.name} subtitle={organizer.phone} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Events" value={orgEvents.length} icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard label="Upcoming" value={upcoming} />
        <StatCard label="Past" value={past} />
        <StatCard label="Credits managed" value={totalCredits.toLocaleString()} />
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info"><User className="h-4 w-4 mr-2" /> Info</TabsTrigger>
          <TabsTrigger value="events"><CalendarDays className="h-4 w-4 mr-2" /> Events</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="rounded-2xl border bg-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field icon={<User className="h-4 w-4" />} label="Organizer ID" value={organizer.id} />
            <Field icon={<User className="h-4 w-4" />} label="Name" value={organizer.name} />
            <Field icon={<Phone className="h-4 w-4" />} label="Phone" value={organizer.phone} />
            <Field icon={<Mail className="h-4 w-4" />} label="Email" value={`${organizer.id}@gala.app`} />
            <Field icon={<Building2 className="h-4 w-4" />} label="Linked venue" value={venue ? venue.name : "—"} />
            <Field icon={<CalendarDays className="h-4 w-4" />} label="Total events" value={String(orgEvents.length)} />
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="rounded-2xl border bg-card overflow-hidden">
            {orgEvents.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No events for this organizer yet.
              </div>
            ) : orgEvents.map((e) => {
              const stats = rsvpStats(e.id);
              return (
                <div key={e.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0">
                  <div>
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString()} · {e.host} · {e.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-end">
                      <p className="text-xs text-muted-foreground">Invited</p>
                      <p className="font-medium">{stats.invited}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-xs text-muted-foreground">Credits</p>
                      <p className="font-medium">{e.creditsConsumed} / {e.creditsTotal}</p>
                    </div>
                    <Badge variant={e.status === "upcoming" ? "default" : "secondary"} className="capitalize">
                      {e.status}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/events/$id" params={{ id: e.id }}>
                        View <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 inline-flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/admin/organizers/$id")({
  component: OrganizerDetailPage,
});
