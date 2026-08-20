import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { useMemo, useState } from "react";
import { events } from "@/mock/data";
import {
  MAIN_ORGANIZER_ID,
  remainingAllowance,
  useBatches,
  useGuestList,
  visibleGuests,
} from "@/mock/guestListStore";
import { format } from "date-fns";
import { ArrowRight, Check, Clock, History, ListChecks, Send, UserPlus, Users } from "lucide-react";

export const Route = createFileRoute("/organizer/invite/")({
  component: InviteHub,
  head: () => ({
    meta: [
      { title: "Invitations | Gala Organizer" },
      { name: "description", content: "Stage your guest list and send invitation batches for your event." },
      { property: "og:title", content: "Invitations | Gala Organizer" },
      { property: "og:description", content: "Stage guests, prepare invitation batches and track what you sent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function InviteHub() {
  const upcoming = events.filter((e) => e.status === "upcoming");
  const [eventId, setEventId] = useState(upcoming[0]?.id ?? events[0].id);
  const all = useGuestList();
  const batches = useBatches();

  const list = useMemo(() => visibleGuests(eventId, MAIN_ORGANIZER_ID, all), [all, eventId]);
  const staged = list.filter((g) => g.state === "staged").length;
  const sent = list.filter((g) => g.state !== "staged").length;
  const accepted = list.filter((g) => g.state === "accepted").length;
  const allowance = remainingAllowance(eventId, MAIN_ORGANIZER_ID);
  const eventBatches = batches.filter((b) => b.eventId === eventId).slice(0, 3);
  const canSend = staged > 0;

  return (
    <MobileShell tabs={organizerTabs} title="Invitations">
      <div className="px-5 pt-2 pb-32 space-y-6">
        <div className="space-y-3">
          <label htmlFor="invite-event" className="text-xs uppercase tracking-widest text-muted-foreground">
            Event
          </label>
          <select
            id="invite-event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full rounded-2xl border bg-card px-5 py-3.5 text-sm"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-foreground text-background p-5">
          <p className="text-xs uppercase tracking-widest text-background/60">Invite allowance</p>
          <p className="font-serif text-4xl mt-1">{Math.max(allowance.remaining, 0)} left</p>
          <p className="text-xs text-background/60 mt-1">
            {allowance.used} used of {allowance.allocated} allocated
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Staged" value={staged} />
          <Stat label="Sent" value={sent} />
          <Stat label="Accepted" value={accepted} />
        </div>

        <section aria-labelledby="flow-heading" className="space-y-3">
          <h2 id="flow-heading" className="text-xs uppercase tracking-widest text-muted-foreground">
            How it works
          </h2>

          <Step
            n={1}
            to="/organizer/guests"
            icon={ListChecks}
            title="Build your guest list"
            desc={staged ? `${staged} guest${staged === 1 ? "" : "s"} staged, not yet sent` : "Add guests manually, from contacts or a CSV file"}
            done={staged > 0 || sent > 0}
          />
          <Step
            n={2}
            to="/organizer/send"
            search={{ event: eventId, inviter: MAIN_ORGANIZER_ID }}
            icon={Send}
            title="Prepare and send invitations"
            desc={canSend ? "Choose format, language, recipients and review names" : "Stage at least one guest to continue"}
            disabled={!canSend}
          />
          <Step
            n={3}
            to="/organizer/rsvp"
            icon={Clock}
            title="Track responses"
            desc="Invitations expire after 72 hours, with a reminder at 48 hours"
          />
        </section>

        <section aria-labelledby="recent-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="recent-heading" className="text-xs uppercase tracking-widest text-muted-foreground">
              Recent batches
            </h2>
            <Link to="/organizer/invite/history" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <History className="h-3.5 w-3.5" /> Full history
            </Link>
          </div>
          {eventBatches.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-4 text-xs text-muted-foreground">
              No invitation batches sent for this event yet.
            </p>
          ) : (
            eventBatches.map((b) => (
              <div key={b.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {b.count} invitation{b.count === 1 ? "" : "s"} · {b.format === "wedding" ? "Wedding" : "Other"}
                  </p>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {b.language === "ar" ? "Arabic" : "English"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sent {format(new Date(b.sentAt), "MMM d, HH:mm")} · expires {format(new Date(b.expiresAt), "MMM d, HH:mm")}
                </p>
              </div>
            ))
          )}
        </section>

        <section aria-labelledby="quick-heading" className="space-y-3">
          <h2 id="quick-heading" className="text-xs uppercase tracking-widest text-muted-foreground">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Quick to="/organizer/invite/single" icon={UserPlus} label="Single invite" />
            <Quick to="/organizer/invite/group" icon={Users} label="Group invite" />
          </div>
        </section>
      </div>

      <div className="absolute bottom-20 inset-x-0 px-5">
        <Link
          to="/organizer/send"
          search={{ event: eventId, inviter: MAIN_ORGANIZER_ID }}
          aria-disabled={!canSend}
          className={`flex items-center justify-center gap-2 rounded-full py-4 text-sm font-medium shadow-elegant ${
            canSend ? "bg-foreground text-background" : "pointer-events-none bg-muted text-muted-foreground"
          }`}
        >
          {canSend ? `Prepare invitations (${staged} ready)` : "Stage guests to continue"}
          {canSend && <ArrowRight className="h-4 w-4 rtl:rotate-180" />}
        </Link>
      </div>
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-4 text-center">
      <p className="font-serif text-2xl leading-none">{value}</p>
      <p className="mt-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function Step({
  n,
  to,
  search,
  icon: Icon,
  title,
  desc,
  done,
  disabled,
}: {
  n: number;
  to: string;
  search?: Record<string, string>;
  icon: typeof Send;
  title: string;
  desc: string;
  done?: boolean;
  disabled?: boolean;
}) {
  const body = (
    <>
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm ${
          done ? "bg-foreground text-background" : "bg-foreground/5"
        }`}
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
    </>
  );
  const cls = `flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors ${
    disabled ? "pointer-events-none opacity-50" : "hover:bg-muted"
  }`;
  if (disabled) return <div className={cls}>{body}</div>;
  return (
    <Link to={to} search={search} className={cls}>
      {body}
    </Link>
  );
}

function Quick({ to, icon: Icon, label }: { to: string; icon: typeof Send; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-3.5 text-sm font-medium hover:bg-muted"
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
