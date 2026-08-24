import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { useMemo, useState } from "react";
import { events } from "@/mock/data";
import {
  MAIN_ORGANIZER_ID,
  cancelInvite,
  expiryLabel,
  invitersForEvent,
  lifecycle,
  restageGuest,
  useBatches,
  useGuestList,
  visibleGuests,
  type StagedGuest,
} from "@/mock/guestListStore";
import { format as fmt } from "date-fns";
import { Plus, RotateCcw, Send, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/invite/")({
  component: SentInvitations,
  head: () => ({
    meta: [
      { title: "Sent invitations | Gala Organizer" },
      { name: "description", content: "Track invitation batches and every guest response from sent to checked in." },
      { property: "og:title", content: "Sent invitations | Gala Organizer" },
      { property: "og:description", content: "Batch history and RSVP lifecycle for your event invitations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STATE_LABEL: Record<StagedGuest["state"], string> = {
  staged: "Ready",
  sent: "Awaiting reply",
  expired: "Expired",
  accepted: "Accepted",
  rejected: "Declined",
  cancelled: "Cancelled",
};

type Tab = "all" | "sent" | "accepted" | "rejected" | "expired";

function SentInvitations() {
  const upcoming = events.filter((e) => e.status === "upcoming");
  const [eventId, setEventId] = useState(upcoming[0]?.id ?? events[0].id);
  const [viewerId, setViewerId] = useState(MAIN_ORGANIZER_ID);
  const [tab, setTab] = useState<Tab>("all");
  const all = useGuestList();
  const batches = useBatches();

  const inviters = invitersForEvent(eventId);
  const sent = useMemo(
    () => visibleGuests(eventId, viewerId, all).filter((g) => g.state !== "staged"),
    [all, eventId, viewerId],
  );
  const stats = lifecycle(sent);
  const eventBatches = batches.filter((b) => b.eventId === eventId && (viewerId === MAIN_ORGANIZER_ID || b.inviterId === viewerId));

  const list = sent.filter((g) =>
    tab === "all" ? true : tab === "sent" ? g.state === "sent" : g.state === tab,
  );

  return (
    <MobileShell
      tabs={organizerTabs}
      title="Invitations"
      right={
        <Link to="/organizer/guests" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted" aria-label="Prepare invitations">
          <Plus className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-4 px-5 pt-2 pb-4">
        <div className="flex gap-2">
          <select
            aria-label="Event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="min-w-0 flex-1 truncate rounded-full border bg-card px-4 py-2.5 text-xs"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <select
            aria-label="Viewing as"
            value={viewerId}
            onChange={(e) => setViewerId(e.target.value)}
            className="min-w-0 flex-1 truncate rounded-full border bg-card px-4 py-2.5 text-xs"
          >
            {inviters.map((i) => (
              <option key={i.id} value={i.id}>{i.id === MAIN_ORGANIZER_ID ? "All inviters" : i.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Stat label="Sent" value={stats.sent} />
          <Stat label="Accepted" value={stats.accepted} />
          <Stat label="Declined" value={stats.rejected} />
          <Stat label="Expired" value={stats.expired} />
        </div>

        {eventBatches.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Batches</h2>
            {eventBatches.slice(0, 4).map((b) => (
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
                  Sent {fmt(new Date(b.sentAt), "MMM d, HH:mm")} · {expiryLabel(b.expiresAt)}
                  {viewerId === MAIN_ORGANIZER_ID && b.inviterId !== MAIN_ORGANIZER_ID && ` · by ${inviters.find((i) => i.id === b.inviterId)?.name}`}
                </p>
              </div>
            ))}
          </section>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(
            [
              ["all", "All"],
              ["sent", `Awaiting ${stats.pending}`],
              ["accepted", `Accepted ${stats.accepted}`],
              ["rejected", `Declined ${stats.rejected}`],
              ["expired", `Expired ${stats.expired}`],
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium ${tab === k ? "border-foreground bg-foreground text-background" : "text-muted-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-5 pb-32">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">No invitations here yet.</p>
            <Link to="/organizer/guests" className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background">
              <Send className="h-3.5 w-3.5" /> Prepare invitations
            </Link>
          </div>
        )}
        {list.map((g) => {
          const batch = batches.find((b) => b.id === g.batchId);
          return (
            <div key={g.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{g.displayName || g.contactName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {g.phone}{g.groupSize > 1 && ` · group of ${g.groupSize}`}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">{STATE_LABEL[g.state]}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">
                  {g.state === "sent" && batch ? expiryLabel(batch.expiresAt) : null}
                  {g.state === "accepted" || g.state === "rejected"
                    ? `${g.state === "accepted" ? "Accepted" : "Declined"} ${g.decidedAt ? fmt(new Date(g.decidedAt), "MMM d") : ""}`
                    : null}
                  {g.state === "expired" && "Invitation expired"}
                  {g.state === "cancelled" && "Cancelled by organizer"}
                  {viewerId === MAIN_ORGANIZER_ID && g.inviterId !== MAIN_ORGANIZER_ID && ` · by ${inviters.find((i) => i.id === g.inviterId)?.name}`}
                </span>
                {g.state === "sent" && (
                  <button onClick={() => { cancelInvite(g.id); toast.success("Invitation cancelled"); }} className="inline-flex shrink-0 items-center gap-1 hover:text-foreground">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                )}
                {(g.state === "expired" || g.state === "cancelled") && (
                  <button onClick={() => { restageGuest(g.id); toast.success(`${g.contactName} moved back to the guest list`); }} className="inline-flex shrink-0 items-center gap-1 hover:text-foreground">
                    <RotateCcw className="h-3.5 w-3.5" /> Re-invite
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-20 px-5">
        <Link
          to="/organizer/guests"
          className="flex items-center justify-center gap-2 rounded-full bg-foreground py-4 text-sm font-medium text-background shadow-elegant"
        >
          <Send className="h-4 w-4" /> Prepare new invitations
        </Link>
      </div>
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-3 text-center">
      <p className="font-serif text-2xl leading-none">{value}</p>
      <p className="mt-1.5 text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
