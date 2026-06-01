import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { events, rsvpStats } from "@/mock/data";
import { StatCard } from "@/components/gala/Primitives";

export const Route = createFileRoute("/organizer/rsvp")({
  component: RSVPDash,
});

function RSVPDash() {
  const totals = events.reduce(
    (acc, e) => {
      const s = rsvpStats(e.id);
      acc.invited += s.invited;
      acc.accepted += s.accepted;
      acc.rejected += s.rejected;
      acc.checkedin += s.checkedin;
      return acc;
    },
    { invited: 0, accepted: 0, rejected: 0, checkedin: 0 },
  );

  return (
    <MobileShell showBack title="RSVP dashboard">
      <div className="px-5 pt-2 pb-8 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Invited" value={totals.invited} />
          <StatCard label="Accepted" value={totals.accepted} />
          <StatCard label="Rejected" value={totals.rejected} />
          <StatCard label="Checked-in" value={totals.checkedin} />
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">By event</h3>
          {events.map(e => {
            const s = rsvpStats(e.id);
            return (
              <div key={e.id} className="py-3 border-b last:border-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-medium truncate">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{s.accepted}/{s.invited}</p>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-foreground" style={{ width: `${(s.accepted / Math.max(s.invited,1)) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
