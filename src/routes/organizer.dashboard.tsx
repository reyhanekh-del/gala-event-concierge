import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ArrowRight, Plus, Send, CreditCard, BarChart3 } from "lucide-react";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { EventCover, StatCard } from "@/components/gala/Primitives";
import { events, totalCredits, notifications } from "@/mock/data";
import { format } from "date-fns";

export const Route = createFileRoute("/organizer/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const c = totalCredits();
  const upcoming = events.filter((e) => e.status === "upcoming").slice(0, 3);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <MobileShell
      tabs={organizerTabs}
      title={<span className="font-serif text-xl">Gala</span>}
      right={
        <Link to="/organizer/notifications" className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-foreground" />}
        </Link>
      }
    >
      <div className="px-5 pt-2 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Good evening</p>
        <h1 className="font-serif text-3xl tracking-tight">Amal</h1>
      </div>

      {/* Credit overview */}
      <div className="px-5">
        <div className="rounded-3xl bg-foreground p-6 text-background shadow-elegant">
          <p className="text-xs uppercase tracking-widest text-background/60">Available credits</p>
          <p className="mt-2 font-serif text-5xl">{c.available.toLocaleString()}</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
            <Mini label="Total" value={c.total} />
            <Mini label="Reserved" value={c.reserved} />
            <Mini label="Used" value={c.consumed} />
          </div>
          <Link
            to="/organizer/credits/buy"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-background py-2.5 text-sm font-medium text-foreground"
          >
            Buy more credits
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-6 grid grid-cols-4 gap-2">
        <QA to="/organizer/events/new" icon={Plus} label="Event" />
        <QA to="/organizer/invite" icon={Send} label="Invite" />
        <QA to="/organizer/credits/buy" icon={CreditCard} label="Credits" />
        <QA to="/organizer/events" icon={BarChart3} label="Analytics" />
      </div>

      {/* Upcoming events */}
      <div className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-2xl">Upcoming</h2>
          <Link to="/organizer/events" className="text-xs text-muted-foreground inline-flex items-center gap-1">
            See all <ArrowRight className="h-3 w-3 rtl:rotate-180" />
          </Link>
        </div>
        <div className="space-y-3">
          {upcoming.map((e) => (
            <Link
              key={e.id}
              to="/organizer/events/$id"
              params={{ id: e.id }}
              className="block"
            >
              <EventCover cover={e.cover} className="h-32">
                <div className="flex h-full flex-col justify-between">
                  <p className="text-xs uppercase tracking-widest opacity-70">{format(new Date(e.date), "EEE, MMM d")}</p>
                  <div>
                    <h3 className="font-serif text-xl leading-tight">{e.name}</h3>
                    <p className="text-xs opacity-75 mt-1">{e.city}</p>
                  </div>
                </div>
              </EventCover>
            </Link>
          ))}
        </div>
      </div>

      {/* RSVP summary */}
      <div className="px-5 mt-8">
        <h2 className="font-serif text-2xl mb-3">RSVP this week</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Accepted" value="184" hint="+12 today" />
          <StatCard label="Pending" value="62" hint="3 expiring" />
          <StatCard label="Rejected" value="18" />
          <StatCard label="Checked-in" value="92" hint="At Royal Wedding" />
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-5 mt-8 mb-8">
        <h2 className="font-serif text-2xl mb-3">Recent activity</h2>
        <div className="space-y-2">
          {notifications.slice(0, 4).map((n) => (
            <div key={n.id} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-foreground/60" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-background/60 uppercase tracking-widest text-[10px]">{label}</p>
      <p className="font-serif text-lg mt-0.5">{value.toLocaleString()}</p>
    </div>
  );
}

function QA({ to, icon: Icon, label }: { to: string; icon: typeof Plus; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 rounded-2xl border bg-card p-3 hover:bg-muted transition-colors">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/5">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
