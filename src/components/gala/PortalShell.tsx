import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { GalaLogo } from "./Logo";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export function PortalShell({
  nav,
  logoTo,
  title,
  children,
}: {
  nav: NavItem[];
  logoTo: string;
  title: string;
  children: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:flex flex-col border-e bg-sidebar">
          <div className="p-6">
            <GalaLogo to={logoTo} />
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground ms-12">{title}</p>
          </div>
          <nav className="flex-1 px-3 pb-6 space-y-1">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = path === n.to || (n.to !== logoTo && path.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-6 text-xs text-muted-foreground">© Gala 2026</div>
        </aside>
        <main className="min-w-0">
          <div className="lg:hidden border-b p-4 flex items-center justify-between bg-background sticky top-0 z-10">
            <GalaLogo to={logoTo} />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{title}</span>
          </div>
          <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-24">{children}</div>
        </main>
      </div>
    </div>
  );
}
