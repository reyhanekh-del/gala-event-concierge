import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer/invite/manual")({
  component: Manual,
});

function Manual() {
  const [text, setText] = useState("Fahad Al-Otaibi, +966 55 111 2233\nLayla Hassan, +971 50 332 1100\n");
  const nav = useNavigate();
  const count = text.split("\n").filter(l => l.trim()).length;
  return (
    <MobileShell showBack title="Manual entry">
      <div className="px-5 pt-2 pb-8 space-y-5">
        <p className="text-sm text-muted-foreground">One guest per line. Format: <code className="text-xs">Name, Phone</code></p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full rounded-2xl border bg-card p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-foreground/10"
        />
        <div className="rounded-2xl bg-muted p-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Detected</span>
          <span className="font-medium">{count} guests · {count} credits</span>
        </div>
        <button
          onClick={() => { toast.success(`Queued ${count} invites`); nav({ to: "/organizer/invite/history" }); }}
          className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
        >
          Send all
        </button>
      </div>
    </MobileShell>
  );
}
