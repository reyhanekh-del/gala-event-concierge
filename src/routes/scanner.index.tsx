import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GalaLogo } from "@/components/gala/Logo";
import { useState } from "react";
import { events } from "@/mock/data";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Delete } from "lucide-react";

export const Route = createFileRoute("/scanner/")({
  component: PinLogin,
});

function PinLogin() {
  const [pin, setPin] = useState("");
  const { t } = useI18n();
  const nav = useNavigate();
  const validPins = events.map((e) => e.scannerPin);

  const submit = (value = pin) => {
    if (validPins.includes(value)) {
      const ev = events.find((e) => e.scannerPin === value)!;
      localStorage.setItem("gala.scanner.event", ev.id);
      nav({ to: "/scanner/scan" });
    } else {
      toast.error("Invalid PIN — try 482917");
      setPin("");
    }
  };

  const press = (k: string) => {
    if (k === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    setPin((p) => {
      const next = (p + k).slice(0, 6);
      if (next.length === 6) setTimeout(() => submit(next), 80);
      return next;
    });
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="min-h-screen bg-foreground text-background flex flex-col items-center justify-between p-6 pt-10">
      <div className="flex flex-col items-center">
        <GalaLogo className="text-background [&_span]:text-background [&>span:first-child]:bg-background [&>span:first-child]:text-foreground" />
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-background/60">{t("scanner.title")}</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-center">{t("scanner.enter_pin")}</h1>

        <div className="mt-8 flex gap-2.5" aria-label="PIN">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-12 w-9 sm:h-14 sm:w-10 rounded-xl border flex items-center justify-center text-2xl font-serif transition-colors ${
                pin[i] ? "bg-background text-foreground border-background" : "border-background/30 text-background/30"
              }`}
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-4">
        {keys.map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => press(k)}
              className="aspect-square rounded-2xl bg-background/10 text-background text-2xl font-serif active:bg-background/20 flex items-center justify-center"
              aria-label={k === "del" ? "Delete" : k}
            >
              {k === "del" ? <Delete className="h-5 w-5" /> : k}
            </button>
          ),
        )}
      </div>

      <p className="text-xs text-background/40">Try PIN 482917</p>
    </div>
  );
}
