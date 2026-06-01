import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SectionHeader } from "@/components/gala/Primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/venue/events/new")({
  component: NewVenueEvent,
});

function NewVenueEvent() {
  const nav = useNavigate();
  return (
    <div className="max-w-2xl">
      <SectionHeader title="New event" subtitle="Set up an event for an organizer to claim." />
      <form
        onSubmit={(e) => { e.preventDefault(); toast.success("Event created"); nav({ to: "/venue/events" }); }}
        className="space-y-5"
      >
        <Field label="Event name" defaultValue="Royal Wedding Reception" />
        <Field label="Organizer name" defaultValue="Amal Al-Saud" />
        <Field label="Organizer phone" defaultValue="+966 50 123 4567" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" defaultValue="2026-07-12" />
          <Field label="Time" defaultValue="20:00" />
        </div>
        <Field label="Expected guests" defaultValue="500" />
        <Field label="Allocated credits" defaultValue="3000" />
        <button className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background">Create event</button>
      </form>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input defaultValue={defaultValue} className="w-full rounded-xl border bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/10" />
    </div>
  );
}
