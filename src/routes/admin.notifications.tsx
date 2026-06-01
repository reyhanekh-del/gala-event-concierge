import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/gala/Primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  component: () => (
    <div className="max-w-2xl">
      <SectionHeader title="Broadcast" subtitle="Send a notification to all venues or organizers" />
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Broadcast queued"); }} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Audience</label>
          <select className="w-full rounded-xl border bg-card px-4 py-3">
            <option>All organizers</option>
            <option>All venue admins</option>
            <option>Everyone</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Title</label>
          <input defaultValue="Scheduled maintenance" className="w-full rounded-xl border bg-card px-4 py-3" />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
          <textarea rows={5} defaultValue="Gala will be briefly offline Sunday 3-4 AM GST for upgrades." className="w-full rounded-xl border bg-card px-4 py-3" />
        </div>
        <button className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background">Send broadcast</button>
      </form>
    </div>
  ),
});
