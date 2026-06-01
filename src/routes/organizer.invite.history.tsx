import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { guests, eventById } from "@/mock/data";
import { format } from "date-fns";

export const Route = createFileRoute("/organizer/invite/history")({
  component: History,
});

function History() {
  const list = [...guests].sort((a, b) => +new Date(b.invitedAt) - +new Date(a.invitedAt)).slice(0, 30);
  return (
    <MobileShell showBack title="Invite history">
      <div className="px-5 pt-2 pb-8 space-y-2">
        {list.map((g) => {
          const e = eventById(g.eventId);
          return (
            <div key={g.id} className="rounded-2xl border bg-card p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{e?.name}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">{format(new Date(g.invitedAt), "MMM d")}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{g.phone}</span>
                <span className="font-medium capitalize">{g.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </MobileShell>
  );
}
