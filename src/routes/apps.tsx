import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Smartphone, Mail, Building2, ScanLine, Shield, Globe } from "lucide-react";
import { GalaLogo, GalaMark } from "@/components/gala/Logo";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "Gala — Invitations, refined." },
      { name: "description", content: "Premium invitation & RSVP platform for venues, organizers and guests across the GCC." },
    ],
  }),
  component: Launcher,
});

function Launcher() {
  const { t, locale, setLocale } = useI18n();
  const apps = [
    { to: "/organizer", label: t("app.organizer"), desc: t("app.organizer.desc"), icon: Smartphone },
    { to: "/invite/g_e_wedding_0", label: t("app.invitee"), desc: t("app.invitee.desc"), icon: Mail },
    { to: "/venue", label: t("app.venue"), desc: t("app.venue.desc"), icon: Building2 },
    { to: "/scanner", label: t("app.scanner"), desc: t("app.scanner.desc"), icon: ScanLine },
    { to: "/admin", label: t("app.admin"), desc: t("app.admin.desc"), icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background bg-noise">
      <header className="flex items-center justify-between px-6 py-6 lg:px-12">
        <GalaLogo />
        <button
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          <Globe className="h-3.5 w-3.5" />
          {locale === "en" ? "العربية" : "English"}
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 lg:px-12 lg:pt-20">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("app.gala")} · MVP</p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
            {t("app.launcher.title")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg">{t("app.launcher.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className="group relative rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-foreground/5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </div>
                <h3 className="mt-5 font-serif text-2xl tracking-tight">{a.label}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{a.desc}</p>
              </Link>
            );
          })}
          <div className="rounded-2xl border border-dashed bg-muted/30 p-6 flex flex-col justify-between">
            <GalaMark className="h-11 w-11 text-2xl" />
            <div>
              <h3 className="font-serif text-2xl tracking-tight">A prototype</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                All data is mocked. Use the floating switcher to move between apps at any time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
