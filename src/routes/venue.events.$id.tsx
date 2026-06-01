import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, StatCard, EventCover } from "@/components/gala/Primitives";
import { eventById, venueById, rsvpStats, organizers } from "@/mock/data";
import { QRCode } from "@/components/gala/QRCode";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/venue/events/$id")({
  component: VenueEventDetail,
});

const TABS = ["Overview", "Credits", "Organizers", "Analytics"] as const;

function VenueEventDetail() {
  const { id } = Route.useParams();
  const e = eventById(id);
  const v = e && venueById(e.venueId);
  const [tab, setTab] = useState<typeof TABS[number]>("Overview");
  const [pin, setPin] = useState(e?.scannerPin ?? "000000");
  if (!e || !v) return null;
  const stats = rsvpStats(e.id);

  const claimUrl = `https://gala.app/claim/${e.id}`;

  return (
    <div>
      <SectionHeader title={e.name} subtitle={`${v.name} · ${format(new Date(e.date), "MMMM d, yyyy")}`} />

      <EventCover cover={e.cover} className="h-44 mb-6">
        <div className="flex h-full items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-75">{e.host}</p>
            <h2 className="font-serif text-3xl">{e.name}</h2>
          </div>
          <span className="text-[10px] uppercase tracking-widest rounded-full border border-current/30 px-2.5 py-1 opacity-75">{e.status}</span>
        </div>
      </EventCover>

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
    </div>
  );
}
