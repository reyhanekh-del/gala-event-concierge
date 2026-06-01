import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SectionHeader } from "@/components/gala/Primitives";
import { creditPackages } from "@/mock/data";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/venue/credits/buy")({
  component: VenueBuy,
});

function VenueBuy() {
  const [picked, setPicked] = useState("p_pro");
  const nav = useNavigate();
  return (
    <div className="max-w-3xl">
      <SectionHeader title="Buy credits" subtitle="Bulk packages for your venue" />
      <div className="grid gap-4 md:grid-cols-3">
        {creditPackages.map(p => (
          <button
            key={p.id}
            onClick={() => setPicked(p.id)}
            className={`text-start rounded-2xl border p-6 ${picked === p.id ? "bg-foreground text-background border-foreground" : "bg-card"}`}
          >
            <p className="text-xs uppercase tracking-widest opacity-60">{p.name}{p.popular && " · Popular"}</p>
            <p className="font-serif text-4xl mt-2">{p.credits.toLocaleString()}</p>
            <p className="text-sm mt-1 opacity-80">credits</p>
            <p className="font-serif text-2xl mt-6">${p.priceUsd}</p>
          </button>
        ))}
      </div>
      <button onClick={() => { toast.success("Payment complete"); nav({ to: "/venue/credits" }); }} className="mt-8 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background">
        Complete purchase
      </button>
    </div>
  );
}
