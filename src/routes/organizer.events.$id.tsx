import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { EventCover, StatCard } from "@/components/gala/Primitives";
import { eventById, guestsByEvent, rsvpStats, coInviters, venueById } from "@/mock/data";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Send, UserPlus, CheckCircle2, Clock, XCircle, AlertCircle, MapPin, Navigation, Copy, KeyRound, ScanLine } from "lucide-react";

export const Route = createFileRoute("/organizer/events/$id")({
  component: EventDetail,
});

const TABS = ["Overview", "Guests", "Credits", "Analytics", "Delegates"] as const;

function EventDetail() {
  const { id } = Route.useParams();
  const e = eventById(id);
  const [tab, setTab] = useState<typeof TABS[number]>("Overview");

  if (!e) return <MobileShell showBack title="Not found"><div className="p-6 text-sm text-muted-foreground">Event not found.</div></MobileShell>;

  const guests = guestsByEvent(e.id);
  const stats = rsvpStats(e.id);
  const delegates = coInviters.filter((c) => c.eventId === e.id);
  const venue = venueById(e.venueId);
  const mapQuery = encodeURIComponent(`${venue?.name ?? ""} ${e.address}`);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const appleMapsHref = `https://maps.apple.com/?q=${mapQuery}`;
  const wazeHref = `https://waze.com/ul?q=${mapQuery}`;
  const mapEmbedSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <MobileShell showBack title={e.name}>
      <div className="px-5 pt-2">
        <EventCover cover={e.cover} className="h-44">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs uppercase tracking-widest opacity-75">{format(new Date(e.date), "EEEE, MMM d · h:mm a")}</p>
            <div>
              <h1 className="font-serif text-3xl leading-tight">{e.name}</h1>
              <p className="text-xs opacity-75 mt-1">{e.address}</p>
            </div>
          </div>
        </EventCover>
      </div>

      <div className="px-5 mt-5 no-scrollbar overflow-x-auto">
        <div className="inline-flex rounded-full border bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 pb-8">
        {tab === "Overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Accepted" value={stats.accepted} />
              <StatCard label="Pending" value={stats.pending} />
              <StatCard label="Rejected" value={stats.rejected} />
              <StatCard label="Checked-in" value={stats.checkedin} />
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">About this event</h3>
              <p className="mt-2 text-sm leading-relaxed">
                Hosted by <span className="font-medium">{e.host}</span> at {e.address}. Doors open one hour before.
                Scanner PIN: <span className="font-mono">{e.scannerPin}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/organizer/invite" className="rounded-2xl bg-foreground text-background p-4 flex items-center gap-3">
                <Send className="h-4 w-4" /> <span className="text-sm font-medium">Invite guest</span>
              </Link>
              <Link to="/organizer/delegation" className="rounded-2xl border p-4 flex items-center gap-3">
                <UserPlus className="h-4 w-4" /> <span className="text-sm font-medium">Add co-inviter</span>
              </Link>
            </div>
          </div>
        )}

        {tab === "Guests" && (
          <div className="space-y-2">
            {guests.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3.5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted font-serif text-lg">
                  {g.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{g.phone}</p>
                </div>
                <StatusPill status={g.status} />
              </div>
            ))}
          </div>
        )}

        {tab === "Credits" && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-foreground text-background p-6">
              <p className="text-xs uppercase tracking-widest text-background/60">Allocated</p>
              <p className="font-serif text-4xl mt-1">{e.creditsTotal.toLocaleString()}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-background/60 uppercase tracking-widest text-[10px]">Reserved</p>
                  <p className="font-serif text-xl mt-0.5">{e.creditsReserved.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-background/60 uppercase tracking-widest text-[10px]">Consumed</p>
                  <p className="font-serif text-xl mt-0.5">{e.creditsConsumed.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground border-b">Recent allocations</div>
              {[
                ["Single invites", 420],
                ["Group invites", 180],
                ["Co-inviter (Huda)", 145],
                ["Co-inviter (Yara)", 80],
              ].map(([label, val]) => (
                <div key={label as string} className="flex items-center justify-between px-4 py-3 border-b last:border-0 text-sm">
                  <span>{label as string}</span>
                  <span className="font-medium">{(val as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Analytics" && (
          <AnalyticsView stats={stats} />
        )}

        {tab === "Delegates" && (
          <div className="space-y-3">
            {delegates.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No co-inviters yet.</p>}
            {delegates.map((d) => (
              <div key={d.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.used}/{d.allocated} used</p>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-foreground" style={{ width: `${(d.used / d.allocated) * 100}%` }} />
                </div>
              </div>
            ))}
            <Link to="/organizer/delegation" className="block rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground hover:bg-muted">
              + Add co-inviter
            </Link>
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
    accepted: { label: "Accepted", cls: "bg-foreground/5 text-foreground", icon: CheckCircle2 },
    pending: { label: "Pending", cls: "bg-foreground/5 text-muted-foreground", icon: Clock },
    rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive", icon: XCircle },
    checkedin: { label: "Checked-in", cls: "bg-foreground text-background", icon: CheckCircle2 },
    expired: { label: "Expired", cls: "bg-warning/10 text-warning-foreground", icon: AlertCircle },
    cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground", icon: XCircle },
  };
  const m = map[status] ?? map.pending;
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest", m.cls)}>
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function AnalyticsView({ stats }: { stats: ReturnType<typeof rsvpStats> }) {
  const total = stats.invited || 1;
  const funnel = [
    { label: "Invited", value: stats.invited },
    { label: "Accepted", value: stats.accepted },
    { label: "Checked-in", value: stats.checkedin },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground">RSVP funnel</h3>
        <div className="mt-4 space-y-3">
          {funnel.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span>{f.label}</span>
                <span className="font-medium">{f.value}</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-foreground" style={{ width: `${(f.value / total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Show rate" value={`${Math.round((stats.checkedin / Math.max(stats.accepted, 1)) * 100)}%`} />
        <StatCard label="Response rate" value={`${Math.round(((stats.accepted + stats.rejected) / total) * 100)}%`} />
      </div>
    </div>
  );
}
