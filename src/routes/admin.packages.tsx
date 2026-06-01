import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/gala/Primitives";
import { creditPackages } from "@/mock/data";

export const Route = createFileRoute("/admin/packages")({
  component: () => (
    <div>
      <SectionHeader title="Credit packages" subtitle="What organizers & venues can buy" />
      <div className="grid gap-4 md:grid-cols-3">
        {creditPackages.map(p => (
          <div key={p.id} className="rounded-2xl border bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.name}{p.popular && " · Popular"}</p>
            <p className="font-serif text-4xl mt-2">{p.credits.toLocaleString()}</p>
            <p className="font-serif text-xl mt-4">${p.priceUsd}</p>
            <button className="mt-4 text-xs underline text-muted-foreground">Edit</button>
          </div>
        ))}
      </div>
    </div>
  ),
});
