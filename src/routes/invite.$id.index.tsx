import { createFileRoute, Link } from "@tanstack/react-router";
import { guestById, eventById, venueById } from "@/mock/data";
import { EventCover } from "@/components/gala/Primitives";
import { GalaLogo } from "@/components/gala/Logo";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$id/")({
  component: Invite,
});

function Invite() {
  const { id } = Route.useParams();
  const g = guestById(id);
  const e = g && eventById(g.eventId);
  const v = e && venueById(e.venueId);
  const [status, setStatus] = useState(g?.status ?? "pending");
  const [showGroup, setShowGroup] = useState(false);

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

        <div className="mt-6 rounded-2xl border bg-card p-5 space-y-4">
          <Detail icon={Calendar} label="Date" value={format(new Date(e.date), "EEEE, MMMM d, yyyy")} />
          <Detail icon={Clock} label="Time" value="8:00 PM onwards" />
          <Detail icon={MapPin} label="Venue" value={`${v?.name ?? ""} · ${e.address}`} />
          {g.groupSize && <Detail icon={Users} label="Party size" value={`Up to ${g.groupSize} guests`} />}
        </div>

        {/* Map placeholder */}
        <div className="mt-4 rounded-2xl border bg-card overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 relative bg-noise">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-7 w-7" />
            </div>
          </div>
          <div className="p-4 text-xs text-muted-foreground">{e.address}</div>
        </div>

        {status === "pending" ? (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                if (g.groupSize && g.groupSize > 1) setShowGroup(true);
                else { setStatus("accepted"); toast.success("RSVP confirmed"); }
              }}
              className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
            >
              Accept with pleasure
            </button>
            <button
              onClick={() => { setStatus("rejected"); toast("Declined with regrets"); }}
              className="w-full rounded-full border py-4 text-sm font-medium"
            >
              Decline with regrets
            </button>
          </div>
        ) : status === "accepted" ? (
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-foreground text-background p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-background/60">RSVP confirmed</p>
              <p className="font-serif text-2xl mt-1">We look forward to seeing you</p>
            </div>
            <Link
              to="/invite/$id/qr"
              params={{ id: g.id }}
              className="block w-full rounded-full bg-foreground py-4 text-sm font-medium text-background text-center"
            >
              View your pass
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border p-5 text-center text-sm text-muted-foreground">
            You declined this invitation. Tap a button above to change your mind.
            <button onClick={() => setStatus("pending")} className="block mx-auto mt-3 underline text-xs">Change response</button>
          </div>
        )}
      </div>

      {showGroup && (
        <GroupSheet
          size={g.groupSize!}
          onClose={() => setShowGroup(false)}
          onConfirm={() => { setShowGroup(false); setStatus("accepted"); toast.success("RSVP confirmed for your party"); }}
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

function GroupSheet({ size, onClose, onConfirm }: { size: number; onClose: () => void; onConfirm: () => void }) {
  const [count, setCount] = useState(size);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-elegant" onClick={e => e.stopPropagation()}>
        <h3 className="font-serif text-2xl">How many will attend?</h3>
        <p className="text-sm text-muted-foreground mt-1">You may bring up to {size} guests.</p>
        <div className="mt-6 flex items-center justify-center gap-6">
          <button onClick={() => setCount(Math.max(1, count - 1))} className="h-12 w-12 rounded-full border text-xl">−</button>
          <span className="font-serif text-5xl w-16 text-center">{count}</span>
          <button onClick={() => setCount(Math.min(size, count + 1))} className="h-12 w-12 rounded-full border text-xl">+</button>
        </div>
        <button onClick={onConfirm} className="mt-6 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
          Confirm all
        </button>
      </div>
    </div>
  );
}
