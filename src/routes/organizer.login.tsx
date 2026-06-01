import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/organizer/login")({
  component: Login,
});

function Login() {
  const [phone, setPhone] = useState("+966 ");
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      <button onClick={() => window.history.back()} className="-ms-2 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
      </button>
      <div className="mt-12">
        <h1 className="font-serif text-4xl tracking-tight">Welcome</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your number to receive a one-time code.</p>
      </div>
      <div className="mt-10 space-y-2">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Mobile number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-2xl border bg-card px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-foreground/10"
          placeholder="+966 55 000 0000"
          dir="ltr"
        />
      </div>
      <button
        onClick={() => nav({ to: "/organizer/verify" })}
        className="mt-8 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
      >
        Send code
      </button>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Demo · any number works
      </p>
    </div>
  );
}
