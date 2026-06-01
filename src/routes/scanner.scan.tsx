import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { events, guests, eventById } from "@/mock/data";
import { ScanLine, X } from "lucide-react";

export const Route = createFileRoute("/scanner/scan")({
  component: Scan,
});

function Scan() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    setEventId(localStorage.getItem("gala.scanner.event") ?? events[0].id);
  }, []);

  const ev = eventId ? eventById(eventId) : null;
  const samples = guests.filter(g => g.eventId === eventId).slice(0, 6);

  const goto = (state: string) => nav({ to: "/scanner/result/$state", params: { state } });

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <Link to="/scanner" className="text-xs text-white/60">Exit</Link>
        <p className="text-xs uppercase tracking-widest text-white/60">{ev?.name}</p>
        <span className="w-10" />
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative aspect-square w-full max-w-sm rounded-3xl border-2 border-white/20 overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
          {/* Reticle */}
          <div className="absolute inset-6 rounded-2xl border-2 border-white/80" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <ScanLine className="h-10 w-10 animate-pulse" />
            <p className="text-xs uppercase tracking-widest text-white/60">Align QR within frame</p>
          </div>
          {/* Animated scan line */}
          <div className="absolute inset-x-6 top-6 bottom-6 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute inset-x-0 h-0.5 bg-white/80 animate-[scan_2s_ease-in-out_infinite]" style={{ top: "50%" }} />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <button
          onClick={() => setPicker(true)}
          className="w-full rounded-full bg-white py-4 text-sm font-medium text-zinc-950"
        >
          Scan demo QR
        </button>
        <p className="text-center text-xs text-white/40">Camera unavailable in prototype — pick a sample.</p>
      </div>

      {picker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setPicker(false)}>
          <div className="w-full bg-background text-foreground rounded-t-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl">Pick a demo QR</h3>
              <button onClick={() => setPicker(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {samples.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (g.status === "checkedin") goto("already");
                    else if (g.status === "rejected" || g.status === "cancelled") goto("cancelled");
                    else if (g.status === "expired") goto("invalid");
                    else goto("valid");
                  }}
                  className="w-full flex items-center justify-between rounded-2xl border bg-card p-4 text-start hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">{g.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{g.status}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">QR</span>
                </button>
              ))}
              <button onClick={() => goto("wrong")} className="w-full rounded-2xl border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted">
                Try QR for another event
              </button>
              <button onClick={() => goto("invalid")} className="w-full rounded-2xl border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted">
                Try invalid QR
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes scan { 0%,100% { top: 8%; } 50% { top: 88%; } }`}</style>
    </div>
  );
}
