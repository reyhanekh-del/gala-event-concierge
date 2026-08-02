import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { Minus, Plus, Star, Check, ArrowRight, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/credits/buy")({
  component: BuyCredits,
  head: () => ({
    meta: [
      { title: "Purchase Invitation Credits | Gala" },
      { name: "description", content: "Buy Gala invitation credits with instant tier pricing. 1 credit = 1 invitation." },
      { property: "og:title", content: "Purchase Invitation Credits | Gala" },
      { property: "og:description", content: "Buy Gala invitation credits with instant tier pricing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Tier = { from: number; to: number; price: number; label: string };

const TIERS: Tier[] = [
  { from: 1, to: 50, price: 0.75, label: "1–50" },
  { from: 51, to: 200, price: 0.7, label: "51–200" },
  { from: 201, to: 350, price: 0.65, label: "201–350" },
  { from: 351, to: 500, price: 0.6, label: "351–500" },
  { from: 501, to: 10000, price: 0.55, label: "501+" },
];

const MIN = 1;
const MAX = 10000;

const tierFor = (q: number) => TIERS.find((t) => q >= t.from && q <= t.to) ?? TIERS[TIERS.length - 1];
const totalFor = (q: number) => q * tierFor(q).price;
const kwd = (n: number) => `${n.toFixed(3)} KWD`;

function BuyCredits() {
  const [qty, setQty] = useState(245);
  const [draft, setDraft] = useState("245");
  const [tiersOpen, setTiersOpen] = useState(true);

  const setQuantity = (n: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, Math.round(n || MIN)));
    setQty(clamped);
    setDraft(String(clamped));
  };

  const tier = tierFor(qty);
  const total = totalFor(qty);

  const suggestion = useMemo(() => {
    const next = TIERS.find((t) => t.from > qty);
    if (!next) return null;
    const targetQty = next.from;
    const targetTotal = totalFor(targetQty);
    const diff = targetTotal - total;
    return {
      qty: targetQty,
      price: next.price,
      diff,
      extra: targetQty - qty,
      best: diff <= 0,
    };
  }, [qty, total]);

  return (
    <MobileShell showBack title="Purchase credits">
      <div className="px-5 pt-4 pb-40 space-y-6">
        {/* Header */}
        <header>
          <h1 className="font-serif text-3xl leading-tight">Purchase Invitation Credits</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Buy invitation credits anytime.
            <br />1 Credit = 1 Invitation.
          </p>
        </header>

        {/* Quantity selector */}
        <section className="rounded-3xl border bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setQuantity(qty - 1)}
              aria-label="Decrease quantity"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted active:scale-95"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="font-serif text-5xl tabular-nums leading-none">{qty.toLocaleString()}</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">invitations</p>
            </div>
            <button
              onClick={() => setQuantity(qty + 1)}
              aria-label="Increase quantity"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6">
            <Slider
              value={[qty]}
              min={MIN}
              max={MAX}
              step={1}
              onValueChange={(v) => setQuantity(v[0])}
              aria-label="Quantity"
            />
            <div className="mt-3 flex justify-between text-[10px] tabular-nums text-muted-foreground">
              {["1", "50", "200", "350", "500", "501+"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <label htmlFor="qty" className="text-xs uppercase tracking-widest text-muted-foreground">
              Enter quantity
            </label>
            <Input
              id="qty"
              inputMode="numeric"
              className="h-12 rounded-2xl bg-background text-base tabular-nums"
              value={draft}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setDraft(v);
                if (v) setQty(Math.min(MAX, Math.max(MIN, Number(v))));
              }}
              onBlur={() => setQuantity(Number(draft))}
            />
          </div>
        </section>

        {/* Current purchase */}
        <section className="rounded-3xl border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Current Purchase</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Selected quantity" value={`${qty.toLocaleString()} Invitations`} />
            <Row label="Current tier" value={`${tier.label} Invitations`} />
            <Row label="Price per invitation" value={kwd(tier.price)} />
          </dl>
          <div className="mt-5 flex items-end justify-between border-t pt-4">
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Total amount</dt>
            <dd className="font-serif text-4xl tabular-nums leading-none">{kwd(total)}</dd>
          </div>
          <button
            onClick={() => toast.success(`${qty.toLocaleString()} credits — ${kwd(total)}`)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90 active:scale-[0.99]"
          >
            Purchase <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </section>

        {/* Better value */}
        {suggestion && (
          <section className="rounded-3xl border border-success/50 bg-success/5 p-5 transition-all">
            <div className="flex items-center gap-2 text-success">
              <Star className="h-4 w-4 fill-current" />
              <p className="text-xs font-medium uppercase tracking-widest">
                {suggestion.best ? "Best Deal" : "Better Value Available"}
              </p>
            </div>
            <p className="mt-3 font-serif text-2xl">Increase to {suggestion.qty.toLocaleString()} invitations</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {suggestion.best ? (
                <>
                  Pay <span className="text-success">{kwd(Math.abs(suggestion.diff))} LESS</span> and receive{" "}
                  {suggestion.extra.toLocaleString()} extra invitations.
                </>
              ) : (
                <>
                  Pay only {kwd(suggestion.diff)} more — new price {kwd(suggestion.price)} per invitation.
                </>
              )}
            </p>
            <button
              onClick={() => setQuantity(suggestion.qty)}
              className="mt-4 w-full rounded-full border border-success/60 bg-background py-3 text-sm font-medium text-success transition-colors hover:bg-success/10"
            >
              {suggestion.best ? "Upgrade Now" : `Upgrade to ${suggestion.qty.toLocaleString()}`}
            </button>
          </section>
        )}

        {/* Pricing tiers */}
        <section className="rounded-3xl border bg-card p-5">
          <button
            onClick={() => setTiersOpen((o) => !o)}
            className="flex w-full items-center justify-between"
            aria-expanded={tiersOpen}
          >
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Pricing Tiers</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", tiersOpen && "rotate-180")} />
          </button>
          {tiersOpen && (
            <ul className="mt-4 space-y-1">
              {TIERS.map((t) => {
                const active = t.from === tier.from;
                return (
                  <li
                    key={t.label}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-colors",
                      active ? "bg-foreground text-background" : "text-muted-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {active && <Check className="h-4 w-4" />}
                      {t.label}
                    </span>
                    <span className="tabular-nums">{kwd(t.price)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Sticky checkout */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="font-serif text-xl tabular-nums leading-tight">{kwd(total)}</p>
          </div>
          <button
            onClick={() => toast.success(`${qty.toLocaleString()} credits — ${kwd(total)}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-4 text-sm font-medium text-background transition-opacity hover:opacity-90 active:scale-[0.99]"
          >
            Continue to Payment <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
