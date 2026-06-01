import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { GalaMark } from "@/components/gala/Logo";

export const Route = createFileRoute("/organizer/splash")({
  component: Splash,
});

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-foreground text-background p-6">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-background text-foreground font-serif text-5xl">
          G
        </div>
        <div className="text-center">
          <h1 className="font-serif text-5xl tracking-tight">Gala</h1>
          <p className="mt-2 text-sm text-background/60">Invitations, refined.</p>
        </div>
      </div>
      <Link
        to="/organizer/login"
        className="mt-16 inline-flex items-center rounded-full bg-background px-8 py-3 text-sm font-medium text-foreground"
      >
        Get started
      </Link>
    </div>
  );
}
