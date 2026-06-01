import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MobileTab = { to: string; label: string; icon: LucideIcon };

export function MobileShell({
  tabs,
  showBack,
  title,
  right,
  children,
}: {
  tabs?: MobileTab[];
  showBack?: boolean;
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-full flex-col bg-background">
      {(title || showBack || right) && (
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            {showBack && (
              <button
                onClick={() => window.history.back()}
                className="-ms-2 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
            )}
            <div className="text-base font-medium truncate">{title}</div>
          </div>
          <div className="flex items-center gap-1">{right}</div>
        </header>
      )}
      <div className="flex-1 overflow-y-auto pb-24">{children}</div>
      {tabs && (
        <nav className="absolute bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = path === t.to || (t.to !== "/organizer/dashboard" && path.startsWith(t.to));
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "scale-110")} />
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
