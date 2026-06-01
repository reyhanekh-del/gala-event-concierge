import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { coInviters, eventById } from "@/mock/data";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/organizer/delegation/")({
  component: Delegation,
});

function Delegation() {
  return (
    <MobileShell showBack title="Delegation" right={<Link to="/organizer/delegation/allocate" className="text-sm font-medium">Allocate</Link>}>
      <div className="px-5 pt-2 pb-8 space-y-4">
        <p className="text-sm text-muted-foreground">Give trusted helpers credits to invite on your behalf.</p>
        {coInviters.map((c) => {
          const e = eventById(c.eventId);
          return (
            <div key={c.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{e?.name}</p>
                </div>
                <p className="text-xs text-muted-foreground">{c.used}/{c.allocated}</p>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-foreground" style={{ width: `${(c.used / c.allocated) * 100}%` }} />
              </div>
            </div>
          );
        })}
        <Link to="/organizer/delegation/allocate" className="flex items-center justify-center gap-2 rounded-2xl border border-dashed py-6 text-sm text-muted-foreground hover:bg-muted">
          <UserPlus className="h-4 w-4" /> Add co-inviter
        </Link>
      </div>
    </MobileShell>
  );
}
