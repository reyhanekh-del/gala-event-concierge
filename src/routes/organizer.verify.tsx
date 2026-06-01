import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/organizer/verify")({
  component: Verify,
});

function Verify() {
  const [code, setCode] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const update = (i: number, v: string) => {
    const next = [...code];
    next[i] = v.slice(-1);
    setCode(next);
    if (v && i < 3) refs.current[i + 1]?.focus();
    if (next.every((c) => c)) setTimeout(() => nav({ to: "/organizer/profile-setup" }), 250);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      <button onClick={() => window.history.back()} className="-ms-2 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
      </button>
      <div className="mt-12">
        <h1 className="font-serif text-4xl tracking-tight">Enter code</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sent to your phone · any 4 digits work.</p>
      </div>
      <div className="mt-12 flex justify-center gap-3" dir="ltr">
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={c}
            onChange={(e) => update(i, e.target.value)}
            inputMode="numeric"
            className="h-16 w-14 rounded-2xl border bg-card text-center font-serif text-3xl outline-none focus:ring-2 focus:ring-foreground/20"
          />
        ))}
      </div>
      <button className="mt-10 text-center text-sm text-muted-foreground hover:text-foreground">Resend code</button>
    </div>
  );
}
