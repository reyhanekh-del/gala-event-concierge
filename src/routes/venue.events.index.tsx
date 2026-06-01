import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeader, EventCover } from "@/components/gala/Primitives";
import { events } from "@/mock/data";
import { format } from "date-fns";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/venue/events/")({
  component: VenueEvents,
});

function VenueEvents() {
  return (
    <div>
      <SectionHeader
        title="Events"
        subtitle={`${events.length} total`}
        action={
          <Link to="/venue/events/new" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            <Plus className="h-4 w-4" /> New event
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map(e => (
          <Link key={e.id} to="/venue/events/$id" params={{ id: e.id }} className="block">
            <EventCover cover={e.cover} className="h-48">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest opacity-75">{format(new Date(e.date), "MMM d, yyyy")}</p>
                  <span className="text-[10px] uppercase tracking-widest rounded-full border border-current/30 px-2 py-0.5 opacity-75">{e.status}</span>
                </div>
                <div>
                  <h3 className="font-serif text-2xl leading-tight">{e.name}</h3>
                  <p className="text-xs opacity-75 mt-1">{e.host}</p>
                </div>
              </div>
            </EventCover>
          </Link>
        ))}
      </div>
    </div>
  );
}
