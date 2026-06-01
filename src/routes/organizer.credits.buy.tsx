import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { creditPackages, transactions } from "@/mock/data";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/credits/buy")({
  component: BuyCredits,
});

function BuyCredits() {
  const [picked, setPicked] = useState("p_pro");
  return (
    <MobileShell showBack title="Buy credits">
      <div className="px-5 pt-2 pb-8 space-y-4">
        <p className="text-sm text-muted-foreground">Credits never expire. One credit equals one invitation.</p>
        {creditPackages.map((p) => {
          const active = picked === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPicked(p.id)}
              className={`w-full text-start rounded-3xl border p-5 transition-all ${active ? "bg-foreground text-background border-foreground" : "bg-card hover:border-foreground/40"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-60">{p.name}{p.popular && " · Most popular"}</p>
                  <p className="font-serif text-3xl mt-1">{p.credits.toLocaleString()} credits</p>
                </div>
                <p className="font-serif text-xl">${p.priceUsd}</p>
              </div>
            </button>
          );
        })}
        <button
          onClick={() => toast.success("Purchase complete — credits added")}
          className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
        >
          Pay securely
        </button>
        <Link to="/organizer/credits/ledger" className="block text-center text-sm text-muted-foreground">View credit ledger →</Link>
      </div>
    </MobileShell>
  );
}
