import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/organizer/profile-setup")({
  component: ProfileSetup,
});

function ProfileSetup() {
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      <div className="mt-8">
        <h1 className="font-serif text-4xl tracking-tight">A few details</h1>
        <p className="mt-2 text-sm text-muted-foreground">Help us personalise your invitations.</p>
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); nav({ to: "/organizer/dashboard" }); }}
        className="mt-10 space-y-5"
      >
        <Field label="Full name" placeholder="Amal Al-Saud" />
        <Field label="Email" placeholder="amal@example.com" />
        <Field label="Organisation (optional)" placeholder="The Ritz-Carlton" />
        <button className="mt-4 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
          Continue
        </button>
      </form>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        defaultValue={placeholder}
        className="w-full rounded-2xl border bg-card px-5 py-4 outline-none focus:ring-2 focus:ring-foreground/10"
      />
    </div>
  );
}
