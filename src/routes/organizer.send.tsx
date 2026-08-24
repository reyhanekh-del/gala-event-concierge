import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { useMemo, useState } from "react";
import { events, eventById } from "@/mock/data";
import {
  EXPIRY_HOURS,
  MAIN_ORGANIZER_ID,
  REMINDER_BEFORE_EXPIRY_HOURS,
  remainingAllowance,
  sendBatch,
  updateGuest,
  updateMember,
  useGuestList,
  visibleGuests,
  type StagedGuest,
} from "@/mock/guestListStore";
import { toast } from "sonner";
import { AlertTriangle, Check, ImagePlus, MessageCircle, Search } from "lucide-react";

type Search = { event?: string; inviter?: string };

export const Route = createFileRoute("/organizer/send")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    event: typeof s['event'] === "string" ? s['event'] : undefined,
    inviter: typeof s['inviter'] === "string" ? s['inviter'] : undefined,
  }),
  component: SendFlow,
  head: () => ({
    meta: [
      { title: "Prepare invitations | Gala Organizer" },
      { name: "description", content: "Set up an invitation batch, choose recipients, review names and preview before sending." },
      { property: "og:title", content: "Prepare invitations | Gala Organizer" },
      { property: "og:description", content: "A guided flow for sending a WhatsApp invitation batch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Format = "wedding" | "other";
type Lang = "en" | "ar";

const STEPS = ["Setup", "Details", "Recipients", "Review"];

const dayFmt = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

function SendFlow() {
  const { event, inviter } = Route.useSearch();
  const nav = useNavigate();
  const all = useGuestList();

  const eventId = event ?? events[0].id;
  const inviterId = inviter ?? MAIN_ORGANIZER_ID;
  const ev = eventById(eventId);

  const [step, setStep] = useState(1);
  const [format, setFormat] = useState<Format | null>(null);
  const [lang, setLang] = useState<Lang | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [hasImage, setHasImage] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [tab, setTab] = useState<"names" | "preview">("names");
  const [warn, setWarn] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const L = (lang ?? "en") as Lang;
  const F = (format ?? "wedding") as Format;
  const rtl = L === "ar";

  const eligible = useMemo(
    () => visibleGuests(eventId, inviterId, all).filter((g) => g.state === "staged"),
    [all, eventId, inviterId],
  );
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return eligible.filter((g) => !t || g.contactName.toLowerCase().includes(t) || g.phone.includes(t));
  }, [eligible, q]);
  const selectedGuests = eligible.filter((g) => selected.has(g.id));
  const yellow = selectedGuests.filter((g) => !g.reviewed);
  const allowance = remainingAllowance(eventId, inviterId);
  const overAllowance = selected.size > Math.max(allowance.remaining, 0);

  const required: { key: string; label: string }[] =
    F === "wedding"
      ? [
          { key: "hosts", label: rtl ? "أسماء المضيفين" : "Host names" },
          { key: "bride", label: rtl ? "اسم العروس" : "Bride name" },
          { key: "groom", label: rtl ? "اسم العريس" : "Groom name" },
        ]
      : [{ key: "eventName", label: rtl ? "اسم المناسبة" : "Event name" }];

  const missingFields = required.filter((f) => !(fields[f.key] ?? "").trim());
  const missingDerived = [!ev?.date && "Event date & time", !ev?.address && "Venue address"].filter(Boolean) as string[];

  const previewGuest = selectedGuests.find((g) => g.id === previewId) ?? selectedGuests[0];

  const partyNames = (g?: StagedGuest) => {
    const names = (g?.members ?? []).map((m) => m.name.trim()).filter(Boolean);
    if (names.length > 1) {
      const sep = rtl ? " و" : " & ";
      return names.slice(0, -1).join(rtl ? "، " : ", ") + sep + names[names.length - 1];
    }
    return names[0];
  };

  const message = (g?: StagedGuest) => {
    const name = g ? g.displayName || partyNames(g) || g.contactName : "—";
    const when = ev ? dayFmt(ev.date, L) : "—";
    if (rtl) {
      return F === "wedding"
        ? `عزيزنا ${name}،\nيسر ${fields['hosts'] || "عائلة المضيف"} دعوتكم لحضور حفل زفاف ${fields['bride'] || "العروس"} و${fields['groom'] || "العريس"}.\n${when} — ${ev?.addressAr ?? ev?.address ?? ""}\n\nالموقع على الخريطة · صفحة التفاصيل · بطاقة الدخول`
        : `عزيزنا ${name}،\nيسعدنا دعوتكم إلى ${fields['eventName'] || ev?.nameAr || ""}.\n${when} — ${ev?.addressAr ?? ev?.address ?? ""}\n\nالموقع على الخريطة · صفحة التفاصيل · بطاقة الدخول`;
    }
    return F === "wedding"
      ? `Dear ${name},\n${fields['hosts'] || "The host family"} request the pleasure of your company at the wedding of ${fields['bride'] || "the bride"} & ${fields['groom'] || "the groom"}.\n${when} — ${ev?.address ?? ""}\n\nMaps · Details page · Entry pass`
      : `Dear ${name},\nYou are invited to ${fields['eventName'] || ev?.name || ""}.\n${when} — ${ev?.address ?? ""}\n\nMaps · Details page · Entry pass`;
  };

  const canContinue =
    (step === 1 && !!format && !!lang) ||
    (step === 2 && missingFields.length === 0 && missingDerived.length === 0) ||
    (step === 3 && selected.size > 0 && !overAllowance);

  const doSend = () => {
    sendBatch({ eventId, inviterId, format: F, language: L, fields, guestIds: [...selected] });
    toast.success(`${selected.size} invitation${selected.size === 1 ? "" : "s"} sent`);
    nav({ to: "/organizer/invite" });
  };

  return (
    <MobileShell showBack title="Prepare invitations">
      <div className="space-y-5 px-5 pt-2 pb-32">
        <div>
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s} className={`h-1 flex-1 rounded-full ${i < step ? "bg-foreground" : "bg-muted"}`} />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step} of 4 · {STEPS[step - 1]}</span>
            {format && lang && step > 1 && (
              <span className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest">
                {F === "wedding" ? "Wedding" : "Other"} · {rtl ? "العربية" : "English"}
              </span>
            )}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Each batch has its own format and language. You can send other batches for {ev?.name} later.
            </p>
            <Group label="Invitation format">
              {(["wedding", "other"] as Format[]).map((f) => (
                <Choice key={f} active={format === f} onClick={() => setFormat(f)} label={f === "wedding" ? "Wedding" : "Other"} />
              ))}
            </Group>
            <Group label="Language">
              {(["en", "ar"] as Lang[]).map((l) => (
                <Choice key={l} active={lang === l} onClick={() => setLang(l)} label={l === "en" ? "English" : "العربية"} />
              ))}
            </Group>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {required.map((f) => (
              <div key={f.key} className="space-y-2">
                <label htmlFor={`f_${f.key}`} className="text-xs uppercase tracking-widest text-muted-foreground">{f.label}</label>
                <input
                  id={`f_${f.key}`}
                  value={fields[f.key] ?? ""}
                  onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
                  dir={rtl ? "rtl" : "ltr"}
                  className="w-full rounded-2xl border bg-card px-5 py-3.5 text-sm"
                />
              </div>
            ))}

            <button
              onClick={() => setHasImage(!hasImage)}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-6 text-sm ${hasImage ? "border-foreground text-foreground" : "text-muted-foreground"}`}
            >
              <ImagePlus className="h-4 w-4" /> {hasImage ? "Header image attached" : "Add header image (optional)"}
            </button>

            <div className="rounded-2xl border bg-card p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Event details used in this invitation</p>
              <p className="mt-2 text-sm">{ev ? dayFmt(ev.date, L) : "—"}</p>
              <p className="text-xs text-muted-foreground">{ev?.address} · maps link, details page and entry pass are added automatically</p>
              {missingDerived.length > 0 && (
                <p className="mt-2 text-xs text-amber-600">Complete on the event first: {missingDerived.join(", ")}</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search guests"
                className="w-full rounded-full border bg-card py-3 pe-4 ps-11 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{selected.size} of {eligible.length} selected</span>
              <button
                onClick={() => setSelected(selected.size === eligible.length ? new Set() : new Set(eligible.map((g) => g.id)))}
                className="font-medium"
              >
                {selected.size === eligible.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            {overAllowance && (
              <p className="rounded-2xl border border-amber-500/50 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                Only {Math.max(allowance.remaining, 0)} invitations remain in this allowance. Deselect {selected.size - Math.max(allowance.remaining, 0)} guest(s).
              </p>
            )}
            {eligible.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No guests ready to invite.</p>}
            {filtered.map((g) => {
              const on = selected.has(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    const n = new Set(selected);
                    if (on) n.delete(g.id); else n.add(g.id);
                    setSelected(n);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-start"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{g.contactName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {g.phone}{g.groupSize > 1 ? ` · group of ${g.groupSize}` : ""}
                    </span>
                  </span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${on ? "border-foreground bg-foreground" : ""}`}>
                    {on && <Check className="h-3 w-3 text-background" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-full border p-1">
              {(["names", "preview"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full py-2 text-xs font-medium ${tab === t ? "bg-foreground text-background" : "text-muted-foreground"}`}
                >
                  {t === "names" ? `Names (${selectedGuests.length})` : "Invitation preview"}
                </button>
              ))}
            </div>

            {tab === "names" ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Review how each guest's name appears in the invitation. Yellow names still use the contact name and may look informal.
                </p>
                {selectedGuests.map((g) => (
                  <div key={g.id} className="rounded-2xl border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${g.reviewed ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <input
                        value={g.displayName ?? g.contactName}
                        onChange={(e) => updateGuest(g.id, { displayName: e.target.value, reviewed: true })}
                        dir={rtl ? "rtl" : "ltr"}
                        aria-label={`Invitation name for ${g.contactName}`}
                        className="min-w-0 flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="truncate">From contacts: {g.contactName}</span>
                      {g.reviewed ? (
                        <button onClick={() => { setPreviewId(g.id); setTab("preview"); }} className="shrink-0 font-medium text-foreground">Preview</button>
                      ) : (
                        <button onClick={() => updateGuest(g.id, { displayName: g.contactName, reviewed: true })} className="shrink-0 font-medium text-foreground">
                          Confirm name
                        </button>
                      )}
                    </div>
                    {g.groupSize > 1 && (
                      <div className="mt-3 space-y-2 rounded-xl bg-muted/60 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Group of {g.groupSize} · each RSVPs separately</p>
                        {g.members.map((m, i) => (
                          <input
                            key={m.id}
                            value={m.name}
                            onChange={(e) => updateMember(g.id, m.id, e.target.value)}
                            dir={rtl ? "rtl" : "ltr"}
                            aria-label={`Group member ${i + 1}`}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  aria-label="Preview guest"
                  value={previewGuest?.id ?? ""}
                  onChange={(e) => setPreviewId(e.target.value)}
                  className="w-full rounded-2xl border bg-card px-5 py-3 text-sm"
                >
                  {selectedGuests.map((g) => (
                    <option key={g.id} value={g.id}>{g.displayName ?? g.contactName}</option>
                  ))}
                </select>
                <div className="rounded-2xl border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium">WhatsApp preview</span>
                  </div>
                  {hasImage && <div className="mb-2 h-24 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-600" />}
                  <pre dir={rtl ? "rtl" : "ltr"} className="whitespace-pre-wrap rounded-2xl bg-emerald-50 p-4 font-sans text-sm dark:bg-emerald-950/30">
                    {message(previewGuest)}
                  </pre>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Invitations expire {EXPIRY_HOURS} hours after sending, with a reminder {REMINDER_BEFORE_EXPIRY_HOURS} hours before expiry.
            </p>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex gap-3 border-t bg-background/95 p-4 backdrop-blur">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="rounded-full border px-6 py-4 text-sm font-medium">Back</button>
        )}
        {step < 4 ? (
          <button
            disabled={!canContinue}
            onClick={() => setStep(step + 1)}
            className="flex-1 rounded-full bg-foreground py-4 text-sm font-medium text-background disabled:bg-muted disabled:text-muted-foreground"
          >
            {step === 3 && selected.size > 0 ? `Continue with ${selected.size}` : "Continue"}
          </button>
        ) : (
          <button
            onClick={() => (yellow.length ? setWarn(true) : setConfirm(true))}
            className="flex-1 rounded-full bg-foreground py-4 text-sm font-medium text-background"
          >
            Send {selected.size} invitation{selected.size === 1 ? "" : "s"}
          </button>
        )}
      </div>

      {warn && (
        <Modal onClose={() => setWarn(false)}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="font-medium">Unreviewed names</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {yellow.length} guest{yellow.length === 1 ? " is" : "s are"} still using their contact name in the invitation. These names may look informal or incorrect.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setWarn(false); setTab("names"); }} className="rounded-full border py-3.5 text-sm font-medium">Review names</button>
            <button onClick={() => { setWarn(false); setConfirm(true); }} className="rounded-full bg-foreground py-3.5 text-sm font-medium text-background">Send anyway</button>
          </div>
        </Modal>
      )}

      {confirm && (
        <Modal onClose={() => setConfirm(false)}>
          <p className="font-medium">Send this batch?</p>
          <p className="text-sm text-muted-foreground">
            {selected.size} WhatsApp invitation{selected.size === 1 ? "" : "s"} · {F === "wedding" ? "Wedding" : "Other"} · {rtl ? "Arabic" : "English"}.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setConfirm(false)} className="rounded-full border py-3.5 text-sm font-medium">Cancel</button>
            <button onClick={doSend} className="rounded-full bg-foreground py-3.5 text-sm font-medium text-background">Send now</button>
          </div>
        </Modal>
      )}
    </MobileShell>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div className="w-full space-y-4 rounded-3xl bg-background p-5" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`rounded-2xl border py-3.5 text-sm font-medium ${active ? "border-foreground bg-foreground text-background" : ""}`}>
      {label}
    </button>
  );
}
