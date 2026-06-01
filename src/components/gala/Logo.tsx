import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function GalaMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background font-serif text-xl leading-none",
        className,
      )}
      aria-hidden
    >
      G
    </span>
  );
}

export function GalaLogo({ to = "/", className }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2.5 group", className)}>
      <GalaMark className="transition-transform group-hover:scale-105" />
      <span className="font-serif text-2xl tracking-tight leading-none">Gala</span>
    </Link>
  );
}
