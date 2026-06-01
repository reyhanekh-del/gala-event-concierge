import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { notifications } from "@/mock/data";
import { format } from "date-fns";

export const Route = createFileRoute("/organizer/notifications")({
  component: Notif,
});

function Notif() {
  return (
    <MobileShell tabs={organizerTabs} title="Notifications">
      <div className="px-5 pt-2 pb-8 space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`rounded-2xl border p-4 ${n.read ? "bg-card" : "bg-foreground/5 border-foreground/20"}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{n.title}</p>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{format(new Date(n.date), "MMM d")}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
