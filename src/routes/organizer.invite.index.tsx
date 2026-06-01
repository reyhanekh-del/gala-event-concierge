import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { UserPlus, Users, BookUser, Edit3, History } from "lucide-react";

export const Route = createFileRoute("/organizer/invite/")({
  component: InviteHub,
});

function InviteHub() {
  const items = [
    { to: "/organizer/invite/single", icon: UserPlus, label: "Single invite", desc: "Invite one guest" },
    { to: "/organizer/invite/group", icon: Users, label: "Group invite", desc: "Primary + additional guests" },
    { to: "/organizer/invite/contacts", icon: BookUser, label: "From contacts", desc: "Pick from your address book" },
    { to: "/organizer/invite/manual", icon: Edit3, label: "Manual entry", desc: "Type many at once" },
    { to: "/organizer/invite/history", icon: History, label: "Invite history", desc: "See everything you've sent" },
  ];
  return (
    <MobileShell tabs={organizerTabs} title="Invite guests">
      <div className="px-5 pt-2 pb-6">
        <p className="text-sm text-muted-foreground">Choose how you'd like to invite.</p>
      </div>
      <div className="px-5 space-y-3">
        {items.map((i) => {
          const Icon = i.icon;
          return (
            <Link key={i.to} to={i.to} className="flex items-center gap-4 rounded-2xl border bg-card p-4 hover:bg-muted transition-colors">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-foreground/5">
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{i.label}</p>
                <p className="text-xs text-muted-foreground">{i.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </MobileShell>
  );
}
