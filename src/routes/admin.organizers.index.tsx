import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/gala/Primitives";
import { Button } from "@/components/ui/button";
import { organizers } from "@/mock/data";

function OrganizersPage() {
  return (
    <div>
      <SectionHeader title="Organizers" subtitle={`${organizers.length} total`} />
      <div className="rounded-2xl border bg-card overflow-hidden">
        {organizers.map((o) => (
          <div key={o.id} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted font-serif">
              {o.name[0]}
            </span>
            <div className="flex-1">
              <p className="font-medium">{o.name}</p>
              <p className="text-xs text-muted-foreground">{o.phone}</p>
            </div>
            <p className="text-xs text-muted-foreground">{o.events} events</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/organizers/$id" params={{ id: o.id }}>
                View <ArrowRight />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/organizers/")({
  component: OrganizersPage,
});
