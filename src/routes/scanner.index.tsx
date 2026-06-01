import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GalaLogo } from "@/components/gala/Logo";
import { useState } from "react";
import { events } from "@/mock/data";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/scanner/")({
  component: PinLogin,
});

function PinLogin() {
  const [pin, setPin] = useState("");
  const { t } = useI18n();
  const nav = useNavigate();
  const validPins = events.map(e => e.scannerPin);

  const submit = () => {
    if (validPins.includes(pin)) {
      const ev = events.find(e => e.scannerPin === pin)!;
      localStorage.setItem("gala.scanner.event", ev.id);
      nav({ to: "/scanner/scan" });
    } else if (pin.length >= 4) {
      toast.error("Invalid PIN — try 482917");
    }
  };

  return (
    <div className="min-h-screen bg-foreground text-background flex flex-col items-center justify-center p-6">
      <GalaLogo className="text-background [&_span]:text-background [&>span:first-child]:bg-background [&>span:first-child]:text-foreground" />
      <p className="mt-8 text-xs uppercase tracking-[0.3em] text-background/60">{t("scanner.title")}</p>
      <h1 className="mt-4 font-serif text-4xl">{t("scanner.enter_pin")}</h1>
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        inputMode="numeric"
        maxLength={6}
        placeholder="● ● ● ● ● ●"
        className="mt-10 w-64 rounded-2xl bg-background/10 px-6 py-5 text-center font-serif text-3xl tracking-[0.4em] text-background outline-none placeholder:text-background/30"
      />
      <button onClick={submit} className="mt-6 rounded-full bg-background px-8 py-3 text-sm font-medium text-foreground">
        Continue
      </button>
      <p className="mt-12 text-xs text-background/40">Try PIN 482917</p>
    </div>
  );
}
