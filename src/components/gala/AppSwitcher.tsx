import { Link, useRouterState } from "@tanstack/react-router";
import { Smartphone, Mail, Building2, ScanLine, Shield, Globe, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const APPS = [
  { to: "/organizer", label: "Organizer", icon: Smartphone, match: "/organizer" },
  { to: "/invite/g_e_wedding_0", label: "Invitee", icon: Mail, match: "/invite" },
  { to: "/venue", label: "Venue", icon: Building2, match: "/venue" },
  { to: "/scanner", label: "Scanner", icon: ScanLine, match: "/scanner" },
  { to: "/admin", label: "Admin", icon: Shield, match: "/admin" },
] as const;

export function AppSwitcher() {
  const { locale, setLocale } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gala.theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gala.theme", next ? "dark" : "light");
  };

  if (path === "/") return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 print:hidden">
      <div className="flex items-center gap-1 rounded-full border bg-card/90 p-1.5 shadow-elegant backdrop-blur">
        <Link to="/" className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          ← Gala
        </Link>
        <span className="h-5 w-px bg-border" />
        {APPS.map((a) => {
          const Icon = a.icon;
          const active = path.startsWith(a.match);
          return (
            <Link
              key={a.to}
              to={a.to}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{a.label}</span>
            </Link>
          );
        })}
        <span className="h-5 w-px bg-border" />
        <button
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Toggle language"
        >
          <Globe className="h-3.5 w-3.5" />
          {locale === "en" ? "AR" : "EN"}
        </button>
        <button
          onClick={toggleTheme}
          className="flex items-center rounded-full px-2 py-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
