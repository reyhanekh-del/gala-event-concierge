import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Check, ChevronRight, CircleAlert, Clock3, Coins, MapPin, Plus, UserRound, X } from "lucide-react";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { Button } from "@/components/ui/button";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/dashboard")({
  head: () => ({
    meta: [
      { title: "Organizer Command Center | Gala" },
      { name: "description", content: "Manage active events, staged guests, invitations, and credits from the Gala organizer command center." },
      { property: "og:title", content: "Organizer Command Center | Gala" },
      { property: "og:description", content: "A focused view of active events, guests, invitations, and credits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [showCreditNote, setShowCreditNote] = useState(false);
  const [numbersResolved, setNumbersResolved] = useState(false);
  const [nudged, setNudged] = useState(false);

  const resolveNumbers = () => {
    setNumbersResolved(true);
    toast.success("Phone numbers ready to review");
  };

  const nudgeExpiring = () => {
    setNudged(true);
    toast.success("Reminder queued for 3 guests");
  };

  return (
    <MobileShell tabs={organizerTabs}>
      <main className="min-h-full bg-command-canvas text-command-ink">
        <header className="sticky top-0 z-10 border-b border-command-warm bg-command-canvas/95 px-5 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <span className="font-serif text-xl italic">Gala</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-command-warm bg-command-surface px-3 text-command-ink shadow-none"
                  onClick={() => setShowCreditNote((value) => !value)}
                  aria-expanded={showCreditNote}
                >
                  <Coins className="h-3.5 w-3.5 text-command-sage" />
                  84 Available
                </Button>
                {showCreditNote && (
                  <div className="absolute end-0 top-10 z-30 w-64 rounded-lg border border-command-warm bg-command-surface p-3 text-xs leading-relaxed shadow-elegant">
                    <p className="font-medium">102 credits in your wallet</p>
                    <p className="mt-1 text-muted-foreground">18 are held in escrow for the staged batch and return automatically if invitations expire.</p>
                  </div>
                )}
              </div>
              <Link to="/organizer/settings" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-command-ink text-primary-foreground" aria-label="Open profile">
                <UserRound className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <div className="px-5 pb-10 pt-6">
          <section className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase text-muted-foreground">Good afternoon</p>
              <h1 className="mt-1 font-serif text-[32px] leading-none">Reyhane</h1>
            </div>
            <Button asChild className="h-10 rounded-full bg-command-ink px-4 text-primary-foreground shadow-none">
              <Link to="/organizer/events/new"><Plus className="h-4 w-4" />New event</Link>
            </Button>
          </section>

          {(!numbersResolved || !nudged) && (
            <section className="mt-7 rounded-lg border border-command-warm bg-command-surface p-4 shadow-soft" aria-labelledby="attention-heading">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleAlert className="h-4 w-4 text-command-sage" />
                  <h2 id="attention-heading" className="text-xs font-semibold uppercase">Needs attention</h2>
                </div>
                <span className="rounded-full bg-command-warm px-2 py-0.5 text-[10px] font-semibold">
                  {Number(!numbersResolved) + Number(!nudged)} {Number(!numbersResolved) + Number(!nudged) === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="mt-3 font-serif text-xl leading-tight">Autumn Charity Gala</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {!numbersResolved && "4 phone numbers need country codes"}
                {!numbersResolved && !nudged && " · "}
                {!nudged && "3 invitations expire in 6h"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!numbersResolved && <Button variant="outline" size="sm" className="rounded-full border-command-warm bg-command-canvas shadow-none" onClick={resolveNumbers}>Resolve numbers <ArrowRight /></Button>}
                {!nudged && <Button variant="outline" size="sm" className="rounded-full border-command-warm bg-command-canvas shadow-none" onClick={nudgeExpiring}>Nudge expiring</Button>}
              </div>
            </section>
          )}

          <section className="mt-8" aria-labelledby="active-events-heading">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Event horizon</p>
                <h2 id="active-events-heading" className="mt-1 font-serif text-2xl">Active events</h2>
              </div>
              <Link to="/organizer/events" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">View all <ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>

            <article className="overflow-hidden rounded-lg border border-command-warm bg-command-surface shadow-soft">
              <Link to="/organizer/events/$id" params={{ id: "e_gala" }} className="block p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-command-sage-soft px-2.5 py-1 text-[10px] font-semibold text-command-sage">UP NEXT</span>
                  <span className="text-xs text-muted-foreground">18 days away</span>
                </div>
                <h3 className="mt-5 font-serif text-[29px] leading-[1.02]">Autumn Charity Gala</h3>
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" />Fri, Oct 24 · 7:00 PM</p>
                  <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Grand Ballroom</p>
                  <p className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5" />Co-host: Studio team</p>
                </div>
                <div className="mt-6 flex items-end justify-between gap-3 text-xs">
                  <span><strong className="font-semibold text-command-ink">142 confirmed</strong> of 180 capacity</span>
                  <span className="font-medium text-command-sage">79% full</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-command-warm"><div className="h-full w-[79%] rounded-full bg-command-sage" /></div>
              </Link>

              <div className="grid grid-cols-3 border-y border-command-warm bg-command-canvas">
                <Pipeline value="142" label="Attending" />
                <Pipeline value="28" label="In-flight" />
                <Pipeline value="18" label="Staged" last />
              </div>

              <div className="bg-command-ink p-4 text-primary-foreground">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-command-sage-soft" />
                  <div>
                    <p className="text-sm font-medium">18 guests staged &amp; polished</p>
                    <p className="mt-0.5 text-[11px] text-primary-foreground/60">18 credits reserved upon dispatch</p>
                  </div>
                </div>
                <Button asChild className="mt-4 h-10 w-full rounded-full bg-command-canvas text-command-ink shadow-none hover:bg-command-warm">
                  <Link to="/organizer/send">Review &amp; Send batch (18) <ArrowRight /></Link>
                </Button>
              </div>
            </article>

            <Link to="/organizer/events/$id" params={{ id: "e_self" }} className="mt-3 flex items-center gap-4 rounded-lg border border-command-warm bg-command-surface p-4 shadow-soft">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-command-warm">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">Nov</span>
                <span className="font-serif text-xl leading-none">12</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-serif text-lg">Private Architectural Preview</h3>
                <p className="mt-1 text-xs text-muted-foreground">24 confirmed · 6 staged</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </section>

          <section className="mt-8" aria-labelledby="activity-heading">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">In motion</p>
                <h2 id="activity-heading" className="mt-1 font-serif text-2xl">Live activity</h2>
              </div>
              <Clock3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 divide-y divide-command-warm border-y border-command-warm">
              <Activity icon={<Check className="h-3.5 w-3.5" />} title="Dr. Arash K. accepted" time="4m ago" />
              <Activity icon={<X className="h-3.5 w-3.5" />} title="Delivery failed: Kamran V." time="1h ago" />
              <Activity icon={<Coins className="h-3.5 w-3.5" />} title="+1 credit restored" detail="Invitation expired" time="2h ago" />
              <Activity icon={<Check className="h-3.5 w-3.5" />} title="Leila M. accepted for two" time="3h ago" />
            </div>
          </section>
        </div>
      </main>
    </MobileShell>
  );
}

function Pipeline({ value, label, last }: { value: string; label: string; last?: boolean }) {
  return (
    <div className={`px-3 py-4 ${last ? "" : "border-e border-command-warm"}`}>
      <p className="font-serif text-2xl leading-none">{value}</p>
      <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

function Activity({ icon, title, detail, time }: { icon: ReactNode; title: string; detail?: string; time: string }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-command-sage-soft text-command-sage">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {detail && <p className="text-[11px] text-muted-foreground">{detail}</p>}
      </div>
      <span className="shrink-0 text-[11px] text-muted-foreground">{time}</span>
    </div>
  );
}
