import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-soft", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="mt-2 font-serif text-3xl leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="font-serif text-3xl tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const COVERS: Record<string, string> = {
  onyx: "from-indigo-950 via-slate-900 to-indigo-800",
  pearl: "from-rose-100 via-amber-50 to-orange-100",
  graphite: "from-emerald-950 via-teal-900 to-emerald-700",
  smoke: "from-purple-950 via-fuchsia-900 to-rose-800",
  ivory: "from-emerald-100 via-lime-50 to-teal-100",
  ink: "from-rose-950 via-red-900 to-amber-800",
};

export function EventCover({ cover, className, children }: { cover: string; className?: string; children?: ReactNode }) {
  const g = COVERS[cover] ?? COVERS.onyx;
  const dark = !["pearl", "ivory"].includes(cover);
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br", g, className)}>
      <div className="absolute inset-0 bg-noise opacity-50" />
      <div className={cn("relative h-full w-full p-6", dark ? "text-white" : "text-zinc-900")}>{children}</div>
    </div>
  );
}
