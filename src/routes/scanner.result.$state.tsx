import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle, XCircle, Ban, ArrowRight, Clock, User, MapPin } from "lucide-react";
import { guestById, eventById, venueById } from "@/mock/data";
import { format } from "date-fns";

type Search = { g?: string };

export const Route = createFileRoute("/scanner/result/$state")({
  validateSearch: (s: Record<string, unknown>): Search => ({ g: typeof s.g === "string" ? s.g : undefined }),
  component: Result,
});

const META: Record<string, { icon: any; tone: "good" | "warn" | "bad"; title: string; body: string }> = {
  valid: { icon: CheckCircle2, tone: "good", title: "Checked in", body: "Welcome — enjoy the event." },
  already: { icon: AlertCircle, tone: "warn", title: "Already checked in", body: "This guest was already admitted." },
  invalid: { icon: XCircle, tone: "bad", title: "Invalid QR code", body: "We couldn't verify this pass. Ask the guest to refresh their invite." },
  cancelled: { icon: Ban, tone: "bad", title: "Invitation cancelled", body: "This guest's invitation was cancelled." },
  wrong: { icon: XCircle, tone: "bad", title: "Wrong event", body: "This QR belongs to another event. Switch scanner PIN." },
};

function Result() {
  const { state } = Route.useParams();
  const { g: guestId } = useSearch({ from: "/scanner/result/$state" });
  const r = META[state] ?? META.invalid;
  const Icon = r.icon;

  const guest = guestId ? guestById(guestId) : undefined;
  const ev = guest ? eventById(guest.eventId) : undefined;
  const venue = ev ? venueById(ev.venueId) : undefined;

  // For "already" use respondedAt as the prior check-in time fallback
  const checkedAt = guest?.respondedAt ? new Date(guest.respondedAt) : new Date();

  const bg =
    r.tone === "good"
      ? "bg-success text-success-foreground"
      : r.tone === "warn"
        ? "bg-warning text-warning-foreground"
        : "bg-destructive text-destructive-foreground";

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Icon className="h-24 w-24" strokeWidth={1.5} />
        <h1 className="mt-6 font-serif text-4xl">{r.title}</h1>

        {guest && (state === "valid" || state === "already") ? (
          <div className="mt-5 w-full max-w-sm rounded-2xl bg-background/15 backdrop-blur p-5 text-start space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 opacity-70 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest opacity-70">Guest</p>
                <p className="font-medium truncate">{guest.name}</p>
                <p className="text-xs opacity-70">Party of {guest.groupSize ?? 1} · {guest.phone}</p>
              </div>
            </div>
            {ev && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 opacity-70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest opacity-70">Event</p>
                  <p className="font-medium truncate">{ev.name}</p>
                  <p className="text-xs opacity-70 truncate">{venue?.name} · {ev.city}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 opacity-70 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest opacity-70">
                  {state === "already" ? "Previously checked in" : "Checked in"}
                </p>
                <p className="font-medium">{format(checkedAt, "EEE, MMM d · h:mm:ss a")}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 max-w-sm opacity-80">{r.body}</p>
        )}
      </div>

      <div className="p-5 space-y-3 max-w-sm w-full mx-auto">
        <Link
          to="/scanner/scan"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-foreground text-background py-4 text-sm font-medium"
        >
          Scan next guest <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
        {state === "wrong" && (
          <Link
            to="/scanner"
            className="flex items-center justify-center w-full rounded-full bg-background/15 backdrop-blur py-3.5 text-sm font-medium"
          >
            Switch event PIN
          </Link>
        )}
      </div>
    </div>
  );
}
