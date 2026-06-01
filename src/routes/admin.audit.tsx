import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/gala/Primitives";
import { auditLog } from "@/mock/data";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/audit")({
  component: () => (
    <div>
      <SectionHeader title="Audit logs" subtitle="Every action, recorded" />
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground border-b">
          <div className="col-span-3">When</div>
          <div className="col-span-3">Actor</div>
          <div className="col-span-3">Action</div>
          <div className="col-span-3">Target</div>
        </div>
        {auditLog.map(a => (
          <div key={a.id} className="grid grid-cols-12 px-6 py-3 text-sm border-b last:border-0">
            <div className="col-span-3 text-muted-foreground">{format(new Date(a.date), "MMM d, h:mm a")}</div>
            <div className="col-span-3 font-mono text-xs">{a.actor}</div>
            <div className="col-span-3">{a.action}</div>
            <div className="col-span-3 text-muted-foreground">{a.target}</div>
          </div>
        ))}
      </div>
    </div>
  ),
});
