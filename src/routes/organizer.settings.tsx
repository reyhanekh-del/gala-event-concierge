import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { Globe, Moon, CreditCard, History, LogOut, RotateCcw, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/settings")({
  component: Settings,
});

function Settings() {
  const { locale, setLocale } = useI18n();
  return (
    <MobileShell tabs={organizerTabs} title="Settings">
      <div className="px-5 pt-2 pb-8 space-y-4">
        <div className="rounded-3xl bg-foreground text-background p-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-background text-foreground font-serif text-lg">A</div>
            <div>
              <p className="font-medium">Amal Al-Saud</p>
              <p className="text-xs text-background/60">+966 55 000 0000</p>
            </div>
          </div>
        </div>

        <Section title="Preferences">
          <Row icon={Globe} label="Language" value={locale === "en" ? "English" : "العربية"} onClick={() => setLocale(locale === "en" ? "ar" : "en")} />
          <Row icon={Moon} label="Appearance" value="System" />
        </Section>

        <Section title="Wallet">
          <RowLink to="/organizer/credits/buy" icon={CreditCard} label="Buy credits" />
          <RowLink to="/organizer/credits/ledger" icon={History} label="Credit ledger" />
          <RowLink to="/organizer/transactions" icon={History} label="Transactions" />
          <RowLink to="/organizer/delegation" icon={History} label="Delegation" />
          <RowLink to="/organizer/rsvp" icon={History} label="RSVP dashboard" />
        </Section>

        <Section title="Account">
          <Row icon={RotateCcw} label="Reset demo data" onClick={() => { localStorage.clear(); toast.success("Reset"); }} />
          <Row icon={LogOut} label="Sign out" />
        </Section>

        <p className="text-center text-xs text-muted-foreground pt-4">Gala v1.0 · prototype</p>
      </div>
    </MobileShell>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground px-2 mb-2">{title}</p>
      <div className="rounded-2xl border bg-card overflow-hidden">{children}</div>
    </div>
  );
}
function Row({ icon: Icon, label, value, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-0 text-start hover:bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
    </button>
  );
}
function RowLink({ to, icon: Icon, label }: any) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0 hover:bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
    </Link>
  );
}
