import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/gala-logo.png.asset.json";

export function GalaMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <img
        src={logoAsset.url}
        alt=""
        className="h-full w-full object-contain dark:invert"
      />
    </span>
  );
}

export function GalaLogo({ to = "/", className }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2.5 group", className)}>
      <GalaMark className="transition-transform group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl tracking-[0.18em] uppercase">Gala</span>
        <span className="text-[9px] tracking-[0.32em] uppercase text-muted-foreground mt-1">
          Occasions
        </span>
      </span>
    </Link>
  );
}
