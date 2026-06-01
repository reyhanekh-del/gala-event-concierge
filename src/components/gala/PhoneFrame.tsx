import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Wraps content in an iPhone-style frame on desktop; full-bleed on mobile.
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-screen bg-muted/40 bg-noise", className)}>
      {/* Mobile: full bleed */}
      <div className="md:hidden min-h-screen bg-background">{children}</div>
      {/* Desktop: phone frame */}
      <div className="hidden md:flex min-h-screen items-center justify-center py-10">
        <div className="relative w-[390px] h-[820px] rounded-[3rem] border-[10px] border-zinc-900 bg-background shadow-elegant overflow-hidden">
          <div className="absolute top-0 left-1/2 z-20 h-7 w-32 -translate-x-1/2 rounded-b-2xl bg-zinc-900" />
          <div className="h-full w-full overflow-y-auto no-scrollbar">{children}</div>
        </div>
      </div>
    </div>
  );
}
