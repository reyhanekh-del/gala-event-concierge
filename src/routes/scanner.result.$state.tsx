import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle, XCircle, Ban, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/scanner/result/$state")({
  component: Result,
});

const MAP: Record<string, { icon: any; title: string; body: string; tone: "good" | "warn" | "bad" }> = {
  valid: { icon: CheckCircle2, title: "Welcome, Fahad Al-Otaibi", body: "Royal Wedding Reception · Garden Hall · Seat 12", tone: "good" },
  already: { icon: AlertCircle, title: "Already checked in", body: "Layla Hassan checked in at 8:14 PM", tone: "warn" },
  invalid: { icon: XCircle, title: "Invalid QR code", body: "We couldn't verify this pass. Ask the guest to refresh their invite.", tone: "bad" },
  cancelled: { icon: Ban, title: "Invitation cancelled", body: "This guest's invitation was cancelled by the organizer.", tone: "bad" },
  wrong: { icon: XCircle, title: "Wrong event", body: "This QR belongs to another event. Switch scanner PIN.", tone: "bad" },
};

function Result() {
  const { state } = Route.useParams();
  const r = MAP[state] ?? MAP.invalid;
  const Icon = r.icon;
  const bg = r.tone === "good" ? "bg-success text-success-foreground" : r.tone === "warn" ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground";

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Icon className="h-24 w-24" strokeWidth={1.5} />
        <h1 className="mt-6 font-serif text-4xl">{r.title}</h1>
        <p className="mt-3 max-w-sm opacity-80">{r.body}</p>
      </div>
      <div className="p-5">
        <Link
          to="/scanner/scan"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-foreground text-background py-4 text-sm font-medium"
        >
          Scan next guest <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
