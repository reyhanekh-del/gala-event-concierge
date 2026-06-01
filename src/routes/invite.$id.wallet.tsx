import { createFileRoute, Link } from "@tanstack/react-router";
import { guestById, eventById } from "@/mock/data";
import { QRCode } from "@/components/gala/QRCode";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/invite/$id/wallet")({
  component: WalletPass,
});

function WalletPass() {
  const { id } = Route.useParams();
  const g = guestById(id);
  const e = g && eventById(g.eventId);
  if (!g || !e) return null;
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 bg-noise pb-32">
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to="/invite/$id/qr" params={{ id: g.id }} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <p className="text-sm font-medium">Wallet</p>
        <span className="w-9" />
      </header>
      <div className="mx-auto max-w-sm px-5 pt-6">
        <div className="rounded-3xl bg-foreground text-background p-6 shadow-elegant">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-background/60">Gala</p>
              <p className="font-serif text-xl mt-1">{e.host}</p>
            </div>
            <div className="text-end">
              <p className="text-[10px] uppercase tracking-widest text-background/60">Doors</p>
              <p className="text-sm">7:30 PM</p>
            </div>
          </div>
          <div className="my-6 border-t border-dashed border-background/20" />
          <p className="text-[10px] uppercase tracking-widest text-background/60">Event</p>
          <p className="font-serif text-2xl">{e.name}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div><p className="text-background/60 uppercase tracking-widest text-[10px]">Date</p><p className="mt-0.5">{format(new Date(e.date), "MMM d, yyyy")}</p></div>
            <div><p className="text-background/60 uppercase tracking-widest text-[10px]">Guest</p><p className="mt-0.5">{g.name}</p></div>
            <div><p className="text-background/60 uppercase tracking-widest text-[10px]">Section</p><p className="mt-0.5">Garden Hall</p></div>
            <div><p className="text-background/60 uppercase tracking-widest text-[10px]">Seat</p><p className="mt-0.5">12</p></div>
          </div>
          <div className="mt-6 flex justify-center">
            <QRCode value={g.id} size={180} />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">Pass added to your wallet (demo).</p>
      </div>
    </div>
  );
}
