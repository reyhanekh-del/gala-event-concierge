import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { useMemo, useState } from "react";
import { events, eventById } from "@/mock/data";
import {
  EXPIRY_HOURS,
  MAIN_ORGANIZER_ID,
  REMINDER_BEFORE_EXPIRY_HOURS,
  sendBatch,
  updateGuest,
  updateMember,
  useGuestList,
  visibleGuests,
  type StagedGuest,
} from "@/mock/guestListStore";
import { toast } from "sonner";
import { AlertTriangle, Check, ChevronRight, MessageCircle } from "lucide-react";

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
      { name: "description", content: "Choose format and language, review guest names, and send an invitation batch." },
      { property: "og:title", content: "Prepare invitations | Gala Organizer" },
      { property: "og:description", content: "Prepare a WhatsApp invitation batch with per-guest name review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Format = "wedding" | "other";
type Lang = "en" | "ar";

const dayFmt = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", { weekday: "long", month: "short", day: "numeric" });

function SendFlow() {
  const { event, inviter } = Route.useSearch();
  const nav = useNavigate();
  const all = useGuestList();

  const eventId = event ?? events[0].id;
  const inviterId = inviter ?? MAIN_ORGANIZER_ID;
  const ev = eventById(eventId);

  const [step, setStep] = useState(1);
  const [format, setFormat] = useState<Format>("wedding");
  const [lang, setLang] = useState<Lang>("en");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [warn, setWarn] = useState(false);

  const staged = useMemo(
    () => visibleGuests(eventId, inviterId, all).filter((g) => g.state === "staged" || g.state === "expired"),
    [all, eventId, inviterId],
  );
  const selectedGuests = staged.filter((g) => selected.has(g.id));
  const yellow = selectedGuests.filter((g) => !g.reviewed);

  const required: { key: string; label: string }[] =
    format === "wedding"
      ? [
          { key: "hosts", label: lang === "ar" ? "أسماء المضيفين" : "Host names" },
          { key: "bride", label: lang === "ar" ? "اسم العروس" : "Bride name" },
          { key: "groom", label: lang === "ar" ? "اسم العريس" : "Groom name" },
        ]
      : [{ key: "eventName", label: lang === "ar" ? "اسم المناسبة" : "Event name" }];

  const missingDerived = [
    !ev?.date && "Event date/time",
    !ev?.address && "Venue address",
    !ev?.city && "Maps URL",
  ].filter(Boolean) as string[];

  const previewGuest = selectedGuests.find((g) => g.id === previewId) ?? selectedGuests[0];

  const message = (g?: StagedGuest) => {
    const name = g ? (g.displayName || g.contactName) : "—";
    const when = ev ? dayFmt(ev.date, lang) : "—";
    if (lang === "ar") {
      return format === "wedding"
        ? `عزيزنا ${name}،\nيسر ${fields['hosts'] || "عائلة المضيف"} دعوتكم لحضور حفل زفاف ${fields['bride'] || "العروس"} و${fields['groom'] || "العريس"}.\n${when} — ${ev?.address ?? ""}\nالموقع على الخريطة · صفحة التفاصيل · بطاقة الدخول`
        : `عزيزنا ${name}،\nيسعدنا دعوتكم إلى ${fields['eventName'] || ev?.nameAr || ""}.\n${when} — ${ev?.address ?? ""}\nالموقع على الخريطة · صفحة التفاصيل · بطاقة الدخول`;
    }
    return format === "wedding"
      ? `Dear ${name},\n${fields['hosts'] || "The host family"} request the pleasure of your company at the wedding of ${fields['bride'] || "the bride"} & ${fields['groom'] || "the groom"}.\n${when} — ${ev?.address ?? ""}\nMaps · Details page · Entry pass`
      : `Dear ${name},\nYou are invited to ${fields['eventName'] || ev?.name || ""}.\n${when} — ${ev?.address ?? ""}\nMaps · Details page · Entry pass`;
  };

  const doSend = () => {
    sendBatch({ eventId, inviterId, format, language: lang, guestIds: [...selected] });
    toast.success(`Sent ${selected.size} invitations · expires in ${EXPIRY_HOURS}h, reminder at ${EXPIRY_HOURS - REMINDER_BEFORE_EXPIRY_HOURS}h`);
    nav({ to: "/organizer/invite/history" });
  };

  return (
    <MobileShell showBack title={`Prepare invitations · ${step}/4`}>
      <div className="px-5 pt-2 pb-32 space-y-5">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <span key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-foreground" : "bg-muted"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{ev?.name}</p>

        {step === 1 && (
          <div className="space-y-5">
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
            <p className="text-xs text-muted-foreground">
              Format and language apply to this batch only. To mix languages, send separate batches.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {required.map((f) => (
              <div key={f.key} className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">{f.label}</label>
                <input
                  value={fields[f.key] ?? ""}
                  onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  className="w-full rounded-2xl border bg-card px-5 py-3.5 text-sm"
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Invitation image (optional)</label>
              <button className="w-full rounded-2xl border border-dashed py-6 text-sm text-muted-foreground">Upload header image</button>
            </div>
            <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground space-y-1">
              <p className="uppercase tracking-widest">Derived from event</p>
              <p>Date · {ev ? dayFmt(ev.date, lang) : "—"}</p>
              <p>Venue · {ev?.address}</p>
              <p>Maps URL · Details page URL · Entry pass QR · Timezone (AST)</p>
              {missingDerived.length > 0 && (
                <p className="text-amber-600">Missing before send: {missingDerived.join(", ")}</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{selected.size} of {staged.length} selected</span>
              <div className="flex gap-3">
                <button onClick={() => setSelected(new Set(staged.map((g) => g.id)))} className="font-medium">Select all</button>
                <button onClick={() => setSelected(new Set())} className="text-muted-foreground">Deselect all</button>
              </div>
            </div>
            {staged.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No staged guests for this inviter.</p>}
            {staged.map((g) => {
              const on = selected.has(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    const n = new Set(selected);
                    if (on) n.delete(g.id); else n.add(g.id);
                    setSelected(n);
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-start"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">{g.contactName}</span>
                    <span className="block text-xs text-muted-foreground">{g.phone}{g.groupSize > 1 ? ` · group of ${g.groupSize}: ${g.members.map((m) => m.name).join(", ")}` : ""}{g.state === "expired" ? " · previous invite expired" : ""}</span>
                  </span>
                  <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${on ? "bg-foreground border-foreground" : ""}`}>
                    {on && <Check className="h-3 w-3 text-background" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
              Review invitation names before sending. Yellow names are still using contact names and may look informal in the invitation.
            </p>

            <div className="rounded-2xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"><MessageCircle className="h-3.5 w-3.5" /></span>
                <span className="text-sm font-medium">Preview · {previewGuest?.displayName || previewGuest?.contactName || "—"}</span>
              </div>
              <pre dir={lang === "ar" ? "rtl" : "ltr"} className="whitespace-pre-wrap rounded-2xl bg-emerald-50 p-4 text-sm font-sans dark:bg-emerald-950/30">{message(previewGuest)}</pre>
            </div>

            {selectedGuests.map((g) => (
              <div key={g.id} className={`rounded-2xl border bg-card p-4 ${g.reviewed ? "border-emerald-500/50" : "border-amber-500/60"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">Contact name · {g.contactName}</p>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${g.reviewed ? "bg-emerald-500" : "bg-amber-500"}`} />
                </div>
                <input
                  value={g.displayName ?? g.contactName}
                  onChange={(e) => updateGuest(g.id, { displayName: e.target.value, reviewed: true })}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  className="mt-2 w-full rounded-xl border bg-background px-4 py-2.5 text-sm"
                />
                {g.groupSize > 1 && (
                  <div className="mt-3 space-y-2 rounded-xl bg-muted/60 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Group of {g.groupSize} · each name RSVPs separately
                    </p>
                    {g.members.map((m, i) => (
                      <div key={m.id} className="flex items-center gap-2">
                        <span className="w-5 shrink-0 text-xs text-muted-foreground">{i + 1}.</span>
                        <input
                          value={m.name}
                          onChange={(e) => updateMember(g.id, m.id, e.target.value)}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                        />
                        {i === 0 && <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <button onClick={() => setPreviewId(g.id)} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    Preview this guest <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                  </button>
                  {!g.reviewed && (
                    <button onClick={() => updateGuest(g.id, { displayName: g.contactName, reviewed: true })} className="font-medium">
                      Confirm name
                    </button>
                  )}
                </div>
              </div>
            ))}

            <p className="text-xs text-muted-foreground">
              Invites expire {EXPIRY_HOURS}h after sending. An idle reminder goes out {EXPIRY_HOURS - REMINDER_BEFORE_EXPIRY_HOURS}h after sending ({REMINDER_BEFORE_EXPIRY_HOURS}h before expiry).
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 border-t bg-background/95 p-4 backdrop-blur">
        {step < 4 ? (
          <button
            disabled={step === 3 && selected.size === 0}
            onClick={() => setStep(step + 1)}
            className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background disabled:bg-muted disabled:text-muted-foreground"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={() => (yellow.length ? setWarn(true) : doSend())}
            className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
          >
            Send {selected.size} invitations
          </button>
        )}
      </div>

      {warn && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={() => setWarn(false)}>
          <div className="w-full rounded-3xl bg-background p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <p className="font-medium">Unreviewed names</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {yellow.length} guests are still using contact names in the invitation. These may look informal or incorrect. Review names before sending, or send anyway.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setWarn(false)} className="rounded-full border py-3.5 text-sm font-medium">Review names</button>
              <button onClick={doSend} className="rounded-full bg-foreground py-3.5 text-sm font-medium text-background">Send anyway</button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}
function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`rounded-2xl border py-3.5 text-sm font-medium ${active ? "bg-foreground text-background border-foreground" : ""}`}>
      {label}
    </button>
  );
}
