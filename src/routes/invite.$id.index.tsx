import { createFileRoute, Link } from "@tanstack/react-router";
import { guestById, eventById, venueById } from "@/mock/data";
import { EventCover } from "@/components/gala/Primitives";
import { GalaLogo } from "@/components/gala/Logo";
import { QRCode } from "@/components/gala/QRCode";
import { format } from "date-fns";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Navigation,
  MessageCircle,
  Phone,
  MessagesSquare,
  X,
  Check,
  Wallet,
  Share2,
  Ban,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/invite/$id/")({
  component: Invite,
});

type PersonStatus = "pending" | "accepted" | "rejected" | "cancelled";
type Person = { id: string; name: string; status: PersonStatus };

const ALLOW_CANCEL_HOURS = 48; // mock policy

function Invite() {
  const { id } = Route.useParams();
  const g = guestById(id);
  const e = g && eventById(g.eventId);
  const v = e && venueById(e.venueId);

  const groupSize = g?.groupSize ?? 1;
  const isMulti = groupSize > 1;

  const [people, setPeople] = useState<Person[]>(() =>
    Array.from({ length: groupSize }, (_, i) => ({
      id: `${id}-p${i + 1}`,
      name: i === 0 ? g?.name ?? "Guest" : `Guest ${i + 1}`,
      status: "pending" as PersonStatus,
    })),
  );
  const [showTalk, setShowTalk] = useState(false);
  const [showSpecify, setShowSpecify] = useState(false);

  const accepted = people.filter((p) => p.status === "accepted");
  const anyResponded = people.some((p) => p.status !== "pending");

  const hoursUntil = useMemo(() => {
    if (!e) return 0;
    return (new Date(e.date).getTime() - Date.now()) / 3600000;
  }, [e]);
  const canCancel = hoursUntil > ALLOW_CANCEL_HOURS;

  if (!g || !e) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <GalaLogo />
          <p className="mt-6 text-muted-foreground">Invitation not found.</p>
        </div>
      </div>
    );
  }

  function confirmAll() {
    setPeople((ps) => ps.map((p) => ({ ...p, status: "accepted" })));
    toast.success(`${groupSize > 1 ? "All guests" : "RSVP"} confirmed`);
  }

  function declineAll() {
    setPeople((ps) => ps.map((p) => ({ ...p, status: "rejected" })));
    toast("Declined with regrets");
  }

  function setPerson(pid: string, status: PersonStatus) {
    setPeople((ps) => ps.map((p) => (p.id === pid ? { ...p, status } : p)));
  }

  function cancelOne(pid: string) {
    setPeople((ps) => ps.map((p) => (p.id === pid ? { ...p, status: "cancelled" } : p)));
    toast("Attendance cancelled");
  }

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v?.name ?? ""} ${e.address}`)}`;
  const appleMapsHref = `https://maps.apple.com/?q=${encodeURIComponent(`${v?.name ?? ""} ${e.address}`)}`;
  const wazeHref = `https://waze.com/ul?q=${encodeURIComponent(`${v?.name ?? ""} ${e.address}`)}`;

  return (
    <div className="min-h-screen bg-background bg-noise pb-32">
      <header className="px-6 py-6 flex justify-center">
        <GalaLogo />
      </header>
      <div className="mx-auto max-w-md px-5">
        <EventCover cover={e.cover} className="aspect-[3/4]">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] opacity-80">You're invited</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-75 mb-3">Hosted by {e.host}</p>
              <h1 className="font-serif text-4xl leading-[1.05]">{e.name}</h1>
              <p className="font-serif italic mt-3 opacity-90">{g.name},</p>
              <p className="text-sm opacity-80 mt-1 max-w-xs">
                Your presence is requested at an evening to remember.
              </p>
            </div>
          </div>
        </EventCover>

        {/* Event details */}
        <div className="mt-6 rounded-2xl border bg-card p-5 space-y-4">
          <Detail icon={Calendar} label="Date" value={format(new Date(e.date), "EEEE, MMMM d, yyyy")} />
          <Detail icon={Clock} label="Time" value={`${format(new Date(e.date), "h:mm a")} · Doors 7:30 PM`} />
          <Detail icon={MapPin} label="Venue" value={v?.name ?? ""} />
          <Detail icon={Navigation} label="Address" value={e.address} />
          {isMulti && <Detail icon={Users} label="Party size" value={`Up to ${groupSize} guests`} />}
        </div>

        {/* Map placeholder + open in apps */}
        <div className="mt-4 rounded-2xl border bg-card overflow-hidden">
          <div className="h-36 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 relative bg-noise">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-7 w-7" />
            </div>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2 border-t">
            <a href={mapsHref} target="_blank" rel="noreferrer" className="rounded-lg border py-2 text-center text-xs font-medium hover:bg-muted">
              Google Maps
            </a>
            <a href={appleMapsHref} target="_blank" rel="noreferrer" className="rounded-lg border py-2 text-center text-xs font-medium hover:bg-muted">
              Apple Maps
            </a>
            <a href={wazeHref} target="_blank" rel="noreferrer" className="rounded-lg border py-2 text-center text-xs font-medium hover:bg-muted">
              Waze
            </a>
          </div>
        </div>

        {/* Venue gallery */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["onyx", "pearl", "graphite"].map((seed, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-xl bg-noise",
                seed === "onyx" && "bg-gradient-to-br from-zinc-800 to-zinc-950",
                seed === "pearl" && "bg-gradient-to-br from-zinc-200 to-zinc-400",
                seed === "graphite" && "bg-gradient-to-br from-zinc-600 to-zinc-800",
              )}
            />
          ))}
        </div>

        {/* Talk to organizer */}
        <button
          onClick={() => setShowTalk(true)}
          className="mt-4 w-full rounded-2xl border bg-card p-4 flex items-center justify-between hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Talk to organizer</p>
              <p className="text-xs text-muted-foreground">Questions about the event?</p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* RSVP section */}
        {!anyResponded ? (
          <div className="mt-6 space-y-3">
            {isMulti ? (
              <>
                <button
                  onClick={confirmAll}
                  className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
                >
                  Confirm all {groupSize} guests
                </button>
                <button
                  onClick={() => setShowSpecify(true)}
                  className="w-full rounded-full border py-4 text-sm font-medium"
                >
                  Specify attendance
                </button>
                <button
                  onClick={declineAll}
                  className="w-full text-center py-2 text-xs text-muted-foreground underline"
                >
                  Decline with regrets
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={confirmAll}
                  className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
                >
                  Accept with pleasure
                </button>
                <button
                  onClick={declineAll}
                  className="w-full rounded-full border py-4 text-sm font-medium"
                >
                  Decline with regrets
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-foreground text-background p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-background/60">RSVP recorded</p>
              <p className="font-serif text-2xl mt-1">
                {accepted.length > 0
                  ? `${accepted.length} of ${groupSize} attending`
                  : "Declined with regrets"}
              </p>
            </div>

            {/* Per-person QR list */}
            {accepted.length > 0 && (
              <div className="space-y-3">
                {people.map((p) => (
                  <PersonCard
                    key={p.id}
                    person={p}
                    event={e}
                    canCancel={canCancel}
                    onCancel={() => cancelOne(p.id)}
                    onAccept={() => setPerson(p.id, "accepted")}
                    onReject={() => setPerson(p.id, "rejected")}
                  />
                ))}
                {!canCancel && (
                  <p className="text-[11px] text-muted-foreground text-center px-4">
                    Cancellation window closed (within {ALLOW_CANCEL_HOURS}h of event).
                  </p>
                )}
              </div>
            )}

            {accepted.length === 0 && isMulti && (
              <button
                onClick={() => {
                  setPeople((ps) => ps.map((p) => ({ ...p, status: "pending" })));
                  setShowSpecify(true);
                }}
                className="w-full rounded-full border py-3 text-sm font-medium"
              >
                Change response
              </button>
            )}
            {accepted.length === 0 && !isMulti && (
              <button
                onClick={() => setPeople((ps) => ps.map((p) => ({ ...p, status: "pending" })))}
                className="block mx-auto text-xs underline text-muted-foreground"
              >
                Change response
              </button>
            )}
          </div>
        )}
      </div>

      {showTalk && <TalkSheet onClose={() => setShowTalk(false)} host={e.host} />}
      {showSpecify && (
        <SpecifySheet
          people={people}
          onClose={() => setShowSpecify(false)}
          onSave={(next) => {
            setPeople(next);
            setShowSpecify(false);
            const acc = next.filter((p) => p.status === "accepted").length;
            toast.success(`${acc} of ${next.length} confirmed`);
          }}
        />
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function PersonCard({
  person,
  event,
  canCancel,
  onCancel,
  onAccept,
  onReject,
}: {
  person: Person;
  event: { name: string; date: string };
  canCancel: boolean;
  onCancel: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [open, setOpen] = useState(person.status === "accepted");

  if (person.status === "cancelled") {
    return (
      <div className="rounded-2xl border bg-card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium line-through opacity-70">{person.name}</p>
          <p className="text-[11px] text-muted-foreground">Attendance cancelled</p>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Cancelled</span>
      </div>
    );
  }
  if (person.status === "rejected") {
    return (
      <div className="rounded-2xl border bg-card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{person.name}</p>
          <p className="text-[11px] text-muted-foreground">Declined</p>
        </div>
        <button onClick={onAccept} className="text-xs underline">
          Change to accept
        </button>
      </div>
    );
  }
  if (person.status === "pending") {
    return (
      <div className="rounded-2xl border bg-card p-4">
        <p className="text-sm font-medium">{person.name}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={onAccept} className="rounded-full bg-foreground py-2 text-xs font-medium text-background flex items-center justify-center gap-1">
            <Check className="h-3.5 w-3.5" /> Accept
          </button>
          <button onClick={onReject} className="rounded-full border py-2 text-xs font-medium flex items-center justify-center gap-1">
            <X className="h-3.5 w-3.5" /> Decline
          </button>
        </div>
      </div>
    );
  }
  // accepted
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Check className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">{person.name}</p>
            <p className="text-[11px] text-muted-foreground">Confirmed · Tap for QR pass</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl bg-foreground text-background p-5">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-background/60">Pass</p>
              <p className="font-serif text-lg mt-1">{event.name}</p>
              <p className="text-[11px] text-background/70">{format(new Date(event.date), "EEE, MMM d · h:mm a")}</p>
            </div>
            <div className="mt-4 bg-background rounded-xl p-4 flex flex-col items-center">
              <QRCode value={person.id} size={220} />
              <p className="mt-3 text-sm font-medium text-foreground">{person.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                Code · {person.id.slice(-8)}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="rounded-full bg-foreground py-2.5 text-xs font-medium text-background flex items-center justify-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" /> Wallet
            </button>
            <button className="rounded-full border py-2.5 text-xs font-medium flex items-center justify-center gap-1.5">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
          {canCancel && (
            <button
              onClick={onCancel}
              className="mt-3 w-full rounded-full border border-rose-300 text-rose-600 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-rose-50"
            >
              <Ban className="h-3.5 w-3.5" /> Cancel attendance
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TalkSheet({ onClose, host }: { onClose: () => void; host: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl">Talk to {host}</h3>
          <button onClick={onClose} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Choose how you'd like to get in touch.</p>
        <div className="mt-5 space-y-2">
          <a
            href="tel:+966501234567"
            className="flex items-center gap-3 rounded-2xl border p-4 hover:bg-muted/50"
          >
            <div className="h-10 w-10 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Phone call</p>
              <p className="text-xs text-muted-foreground">+966 50 123 4567</p>
            </div>
          </a>
          <a
            href="https://wa.me/966501234567"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border p-4 hover:bg-muted/50"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <MessagesSquare className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Chat directly with the host</p>
            </div>
          </a>
          <button
            onClick={() => {
              toast.success("Message sent (demo)");
              onClose();
            }}
            className="w-full flex items-center gap-3 rounded-2xl border p-4 hover:bg-muted/50 text-left"
          >
            <div className="h-10 w-10 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">In-app message</p>
              <p className="text-xs text-muted-foreground">Reply right inside Gala</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function SpecifySheet({
  people,
  onClose,
  onSave,
}: {
  people: Person[];
  onClose: () => void;
  onSave: (next: Person[]) => void;
}) {
  const [draft, setDraft] = useState<Person[]>(() =>
    people.map((p) => ({ ...p, status: p.status === "pending" ? "accepted" : p.status })),
  );
  const accepted = draft.filter((p) => p.status === "accepted").length;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-elegant max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl">Specify attendance</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {accepted} of {draft.length} attending
            </p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {draft.map((p, idx) => (
            <div key={p.id} className="rounded-2xl border p-3">
              <input
                value={p.name}
                onChange={(ev) => {
                  const v = ev.target.value;
                  setDraft((d) => d.map((x, i) => (i === idx ? { ...x, name: v } : x)));
                }}
                className="w-full bg-transparent text-sm font-medium outline-none"
                placeholder={`Guest ${idx + 1} name`}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setDraft((d) => d.map((x, i) => (i === idx ? { ...x, status: "accepted" } : x)))}
                  className={cn(
                    "flex-1 rounded-full py-1.5 text-xs font-medium border",
                    p.status === "accepted" ? "bg-foreground text-background border-foreground" : "",
                  )}
                >
                  Attending
                </button>
                <button
                  onClick={() => setDraft((d) => d.map((x, i) => (i === idx ? { ...x, status: "rejected" } : x)))}
                  className={cn(
                    "flex-1 rounded-full py-1.5 text-xs font-medium border",
                    p.status === "rejected" ? "bg-rose-600 text-white border-rose-600" : "",
                  )}
                >
                  Not attending
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => onSave(draft)}
          className="mt-5 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
        >
          Save responses
        </button>
      </div>
    </div>
  );
}
