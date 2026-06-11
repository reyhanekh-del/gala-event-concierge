import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { events, guests, eventById } from "@/mock/data";
import { ScanLine, X, LogOut, Camera, Users } from "lucide-react";

export const Route = createFileRoute("/scanner/scan")({
  component: Scan,
});

function Scan() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    setEventId(localStorage.getItem("gala.scanner.event") ?? events[0].id);
  }, []);

  const ev = eventId ? eventById(eventId) : null;
  const eventGuests = guests.filter((g) => g.eventId === eventId).slice(0, 6);
  const otherGuests = guests.filter((g) => g.eventId !== eventId).slice(0, 2);

  const gotoGuest = (guestId: string, state: string) =>
    nav({ to: "/scanner/result/$state", params: { state }, search: { g: guestId } });
  const gotoState = (state: string) =>
    nav({ to: "/scanner/result/$state", params: { state }, search: {} });

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="p-4 flex items-center justify-between gap-3">
        <Link to="/scanner" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
          <LogOut className="h-3.5 w-3.5" /> Exit
        </Link>
        <div className="min-w-0 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/50">Scanning</p>
          <p className="text-xs text-white truncate">{ev?.name}</p>
        </div>
        <span className="w-10" />
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="relative aspect-square w-full max-w-sm rounded-3xl border-2 border-white/20 overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
          <div className="absolute inset-6 rounded-2xl border-2 border-white/80" />
          {/* corner marks */}
          {[
            "top-6 left-6 border-t-4 border-l-4 rounded-tl-2xl",
            "top-6 right-6 border-t-4 border-r-4 rounded-tr-2xl",
            "bottom-6 left-6 border-b-4 border-l-4 rounded-bl-2xl",
            "bottom-6 right-6 border-b-4 border-r-4 rounded-br-2xl",
          ].map((c) => (
            <div key={c} className={`absolute h-10 w-10 border-white ${c}`} />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <ScanLine className="h-10 w-10 animate-pulse" />
            <p className="text-xs uppercase tracking-widest text-white/60">
              {cameraOn ? "Looking for QR…" : "Align QR within frame"}
            </p>
          </div>
          <div className="absolute inset-x-6 top-6 bottom-6 overflow-hidden rounded-2xl pointer-events-none">
            <div
              className="absolute inset-x-0 h-0.5 bg-white/80 animate-[scan_2s_ease-in-out_infinite]"
              style={{ top: "50%" }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3 max-w-sm w-full mx-auto">
        <button
          onClick={() => {
            setCameraOn(true);
            setPicker(true);
          }}
          className="w-full rounded-full bg-white py-4 text-sm font-medium text-zinc-950 flex items-center justify-center gap-2"
        >
          <Camera className="h-4 w-4" /> {cameraOn ? "Tap to simulate scan" : "Enable camera"}
        </button>
        <p className="text-center text-[11px] text-white/40">
          Camera unavailable in prototype — pick a sample guest below.
        </p>
      </div>

      {picker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setPicker(false)}>
          <div
            className="w-full bg-background text-foreground rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-xl">Pick a demo QR</h3>
                <p className="text-xs text-muted-foreground">Simulates what the camera reads</p>
              </div>
              <button onClick={() => setPicker(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
              <Users className="h-3 w-3" /> Guests for this event
            </p>
            <div className="space-y-2">
              {eventGuests.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (g.status === "checkedin") gotoGuest(g.id, "already");
                    else if (g.status === "rejected" || g.status === "cancelled") gotoGuest(g.id, "cancelled");
                    else if (g.status === "expired") gotoState("invalid");
                    else gotoGuest(g.id, "valid");
                  }}
                  className="w-full flex items-center justify-between rounded-2xl border bg-card p-4 text-start hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{g.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {g.status} · party of {g.groupSize ?? 1}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 ms-2">
                    {g.id.slice(-6).toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-5 mb-2">
              Error scenarios
            </p>
            <div className="space-y-2">
              {otherGuests.map((g) => (
                <button
                  key={g.id}
                  onClick={() => gotoGuest(g.id, "wrong")}
                  className="w-full flex items-center justify-between rounded-2xl border border-dashed p-4 text-start text-sm text-muted-foreground hover:bg-muted"
                >
                  <span className="truncate">QR for other event — {g.name}</span>
                  <span className="text-[10px] shrink-0 ms-2">WRONG EVENT</span>
                </button>
              ))}
              <button
                onClick={() => gotoState("invalid")}
                className="w-full rounded-2xl border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted text-start"
              >
                Unreadable / invalid QR
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes scan { 0%,100% { top: 8%; } 50% { top: 88%; } }`}</style>
    </div>
  );
}
