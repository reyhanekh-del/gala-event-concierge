import { createFileRoute, Link } from "@tanstack/react-router";
import { guestById, eventById } from "@/mock/data";
import { QRCode } from "@/components/gala/QRCode";
import { GalaLogo } from "@/components/gala/Logo";
import { format } from "date-fns";
import { Wallet, Share2, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/invite/$id/qr")({
  component: QR,
});

function QR() {
  const { id } = Route.useParams();
  const g = guestById(id);
  const e = g && eventById(g.eventId);
  if (!g || !e) return null;

  return (
    <div className="min-h-screen bg-background bg-noise pb-32">
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to="/invite/$id" params={{ id: g.id }} className="-ms-2 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <GalaLogo />
        <span className="w-9" />
      </header>

      <div className="mx-auto max-w-sm px-5">
        <div className="rounded-3xl bg-foreground text-background overflow-hidden shadow-elegant">
          <div className="p-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-background/60">Your pass</p>
            <h2 className="font-serif text-2xl mt-2">{e.name}</h2>
            <p className="text-xs text-background/70 mt-1">{format(new Date(e.date), "EEE, MMM d · h:mm a")}</p>
          </div>
          <div className="bg-background p-6 flex flex-col items-center text-foreground">
            <QRCode value={g.id} size={240} />
            <p className="mt-4 font-serif text-xl">{g.name}</p>
            <p className="text-xs text-muted-foreground">Section · Garden Hall · Seat 12</p>
          </div>
          <div className="p-5 grid grid-cols-3 gap-3 text-center text-[10px] uppercase tracking-widest text-background/60 border-t border-background/10">
            <div><p>Code</p><p className="text-background mt-1 font-mono text-xs normal-case tracking-normal">{g.id.slice(-8)}</p></div>
            <div><p>Status</p><p className="text-background mt-1 normal-case tracking-normal">Confirmed</p></div>
            <div><p>Guests</p><p className="text-background mt-1 normal-case tracking-normal">{g.groupSize ?? 1}</p></div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">Show this at the door for instant check-in.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to="/invite/$id/wallet"
            params={{ id: g.id }}
            className="rounded-full bg-foreground py-3.5 text-sm font-medium text-background flex items-center justify-center gap-2"
          >
            <Wallet className="h-4 w-4" /> Add to Wallet
          </Link>
          <button className="rounded-full border py-3.5 text-sm font-medium flex items-center justify-center gap-2">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
