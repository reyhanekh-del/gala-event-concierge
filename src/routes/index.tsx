import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Globe,
  Mail,
  QrCode,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { GalaLogo, GalaMark } from "@/components/gala/Logo";
import { useI18n } from "@/lib/i18n";
import organizerShot from "@/assets/landing/organizer-dashboard.png";
import inviteShot from "@/assets/landing/invite.png";
import venueShot from "@/assets/landing/venue-dashboard.png";
import scannerShot from "@/assets/landing/scanner.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gala — Invitations, refined." },
      {
        name: "description",
        content:
          "Premium invitation & RSVP platform for venues, organizers and guests across the GCC. Send, confirm, check in — beautifully.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { locale, setLocale } = useI18n();

  const features = [
    {
      icon: Mail,
      title: "Refined invitations",
      body: "Serif typography, quiet motion and a monochrome palette that reads as premium — in Arabic and English.",
    },
    {
      icon: QrCode,
      title: "QR RSVPs & check-in",
      body: "Guests confirm on a shareable link. A scannable pass per attendee. Door staff scan with a PIN — done.",
    },
    {
      icon: BarChart3,
      title: "Live analytics",
      body: "Funnel, response times, attendance and revenue — for organizers, venues and Gala admin.",
    },
    {
      icon: ShieldCheck,
      title: "Roles & delegation",
      body: "Venues buy credits, organizers claim events, co-inviters get allocations. Everything auditable.",
    },
    {
      icon: Languages,
      title: "Arabic-first, RTL",
      body: "Every screen mirrors cleanly. Minion Pro for headlines, Noto Kufi for Arabic body.",
    },
    {
      icon: Sparkles,
      title: "Five apps, one system",
      body: "Organizer mobile · Invitee web · Venue portal · Door scanner · Gala admin.",
    },
  ];

  const shots = [
    { src: organizerShot, label: "Organizer · Dashboard", to: "/organizer/dashboard" },
    { src: inviteShot, label: "Invitee · RSVP", to: "/invite/g_e_wedding_0" },
    { src: venueShot, label: "Venue · Portal", to: "/venue" },
    { src: scannerShot, label: "Door · Scanner", to: "/scanner/scan" },
  ];

  return (
    <div className="min-h-screen bg-background bg-noise">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <GalaLogo />
          <nav className="hidden items-center gap-8 md:flex text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#preview" className="hover:text-foreground">Preview</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <Globe className="h-3.5 w-3.5" />
              {locale === "en" ? "العربية" : "English"}
            </button>
            <Link
              to="/apps"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90"
            >
              Explore prototype
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 lg:px-12 lg:pt-32 lg:pb-24">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Gala · Occasions
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-6xl leading-[1.02] tracking-tight md:text-8xl">
            Invitations,<br />refined.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A premium invitation and RSVP platform for the GCC. Built for hotels,
            organizers and their guests — from the first invite to the final
            check-in.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/apps"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90"
            >
              Explore the prototype
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link
              to="/invite/$id"
              params={{ id: "g_e_wedding_0" }}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium hover:bg-muted"
            >
              See a sample invite
            </Link>
          </div>
        </div>

        {/* hero image collage */}
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="relative grid grid-cols-12 gap-4 pb-24">
            <div className="col-span-12 md:col-span-7 rounded-3xl overflow-hidden border shadow-elegant bg-card">
              <img src={venueShot} alt="Venue portal dashboard" className="w-full h-auto" />
            </div>
            <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
              <div className="rounded-3xl overflow-hidden border shadow-elegant bg-card">
                <img src={organizerShot} alt="Organizer app" className="w-full h-auto" />
              </div>
              <div className="rounded-3xl overflow-hidden border shadow-elegant bg-card">
                <img src={scannerShot} alt="Door scanner" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-12 lg:px-12 lg:py-32">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              About Gala
            </p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl tracking-tight leading-[1.05]">
              The way a proper invitation should feel — online.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>
              Gala replaces the WhatsApp-forwarded flyer with something quieter,
              clearer and worthy of the occasion. Venues manage credits and
              events. Organizers claim, invite and delegate. Guests confirm on a
              beautiful link and walk in with a QR pass.
            </p>
            <p>
              Every screen is bilingual, mirrors for Arabic, and behaves like a
              product built for the region rather than translated into it.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-4">
              <Stat n="5" label="Connected apps" />
              <Stat n="AR / EN" label="Bilingual, RTL" />
              <Stat n="100%" label="Mock prototype" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              What's inside
            </p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl tracking-tight">
              End-to-end, thoughtfully.
            </h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-card p-8">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  <h3 className="mt-6 font-serif text-2xl tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Preview / screenshots */}
      <section id="preview" className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Preview
              </p>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl tracking-tight">
                Every surface, in one place.
              </h2>
            </div>
            <Link
              to="/apps"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              Open the launcher
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {shots.map((s) => (
              <Link
                key={s.label}
                to={s.to}
                className="group rounded-3xl overflow-hidden border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={s.src}
                    alt={s.label}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm font-medium">{s.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32 text-center">
          <GalaMark className="mx-auto h-12 w-12 invert" />
          <h2 className="mt-8 font-serif text-5xl md:text-6xl tracking-tight">
            Step inside the prototype.
          </h2>
          <p className="mt-4 text-background/60 max-w-lg mx-auto">
            All five apps are clickable with realistic mock data. No sign-in required.
          </p>
          <div className="mt-10">
            <Link
              to="/apps"
              className="inline-flex items-center gap-2 rounded-full bg-background px-7 py-3 text-sm font-medium text-foreground hover:opacity-90"
            >
              Explore Gala
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 lg:px-12">
          <GalaLogo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gala Occasions · Prototype
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl text-foreground">{n}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
