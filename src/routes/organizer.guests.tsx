import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { useMemo, useRef, useState } from "react";
import { CSV_TEMPLATE, parseGuestCsv, type CsvError, type CsvRow } from "@/lib/csvGuests";
import { events } from "@/mock/data";
import {
  MAIN_ORGANIZER_ID,
  addGuest,
  makeMember,
  checkDuplicate,
  invitersForEvent,
  remainingAllowance,
  removeGuest,
  restageGuest,
  useGuestList,
  validatePhone,
  visibleGuests,
  type StagedGuest,
} from "@/mock/guestListStore";
import { toast } from "sonner";
import {
  AlertTriangle,
  BookUser,
  Download,
  FileUp,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

export const Route = createFileRoute("/organizer/guests")({
  component: GuestList,
  head: () => ({
    meta: [
      { title: "Guest list | Gala Organizer" },
      { name: "description", content: "Prepare and manage the people you want to invite, before any invitation is sent." },
      { property: "og:title", content: "Guest list | Gala Organizer" },
      { property: "og:description", content: "Add, import and organise guests before preparing an invitation batch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const CONTACTS: [string, string][] = [
  ["Ghada Al-Harbi", "+966551234001"],
  ["Bader Al-Salem", "+965991234002"],
  ["Noura Al-Dosari", "+974331234003"],
  ["Jassim Al-Kuwari", "+974551234004"],
  ["Dana Al-Fahad", "+971501234005"],
];

const STATE_LABEL: Record<StagedGuest["state"], string> = {
  staged: "Ready",
  sent: "Invited",
  expired: "Expired",
  accepted: "Accepted",
  rejected: "Declined",
  cancelled: "Cancelled",
};

const STATE_STYLE: Record<StagedGuest["state"], string> = {
  staged: "border-foreground/20 text-muted-foreground",
  sent: "border-foreground bg-foreground text-background",
  expired: "border-amber-500/60 text-amber-700 dark:text-amber-300",
  accepted: "border-emerald-500/60 text-emerald-700 dark:text-emerald-300",
  rejected: "border-foreground/15 text-muted-foreground",
  cancelled: "border-foreground/15 text-muted-foreground",
};

type Filter = "ready" | "invited" | "all";

function GuestList() {
  const upcoming = events.filter((e) => e.status === "upcoming");
  const [eventId, setEventId] = useState(upcoming[0]?.id ?? events[0].id);
  const [viewerId, setViewerId] = useState(MAIN_ORGANIZER_ID);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("ready");
  const [add, setAdd] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [csv, setCsv] = useState<{ fileName: string; rows: CsvRow[]; errors: CsvError[]; total: number } | null>(null);
  const [confirmDupe, setConfirmDupe] = useState<{ message: string; commit: () => void } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const all = useGuestList();

  const inviters = invitersForEvent(eventId);
  const scoped = useMemo(() => visibleGuests(eventId, viewerId, all), [all, eventId, viewerId]);
  const readyCount = scoped.filter((g) => g.state === "staged").length;
  const invitedCount = scoped.filter((g) => g.state !== "staged").length;
  const allowance = remainingAllowance(eventId, viewerId);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return scoped
      .filter((g) => (filter === "all" ? true : filter === "ready" ? g.state === "staged" : g.state !== "staged"))
      .filter((g) => !term || g.contactName.toLowerCase().includes(term) || g.phone.includes(term));
  }, [scoped, filter, q]);

  const tryAdd = (name: string, phone: string, extraNames: string[] = []) => {
    if (!name.trim()) return toast.error("Guest name is required");
    if (!validatePhone(phone)) return toast.error("Enter a valid international phone number, e.g. +96650…");
    const members = [name.trim(), ...extraNames.map((n) => n.trim()).filter(Boolean)].map(makeMember);
    const dupe = checkDuplicate(eventId, phone, name);
    if (dupe.kind === "blocked") return toast.error(dupe.message);
    const commit = () => {
      addGuest({ eventId, inviterId: viewerId, contactName: name.trim(), phone, members });
      toast.success(members.length > 1 ? `${name} + ${members.length - 1} named guests added` : `${name} added`);
    };
    if (dupe.kind === "confirm") return setConfirmDupe({ message: dupe.message, commit });
    commit();
  };

  const onFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) return toast.error("Please choose a .csv file");
    if (file.size > 1_000_000) return toast.error("File is too large (max 1 MB)");
    const parsed = parseGuestCsv(await file.text());
    if (!parsed.total) return toast.error("No guest rows found in this file");
    setImportOpen(false);
    setCsv({ fileName: file.name, ...parsed });
  };

  const importCsv = () => {
    if (!csv) return;
    let added = 0;
    const skipped: CsvError[] = [];
    csv.rows.forEach((r) => {
      const dupe = checkDuplicate(eventId, r.phone, r.name);
      if (dupe.kind === "blocked") {
        skipped.push({ line: r.line, raw: `${r.name}, ${r.phone}`, reason: dupe.message });
        return;
      }
      addGuest({
        eventId,
        inviterId: viewerId,
        contactName: r.name,
        phone: r.phone,
        members: Array.from({ length: r.groupSize }, (_, k) => makeMember(k === 0 ? r.name : `Guest ${k + 1}`)),
      });
      added++;
    });
    setCsv(skipped.length ? { fileName: "Import report", rows: [], errors: skipped, total: skipped.length } : null);
    toast[added ? "success" : "error"](
      added ? `Imported ${added} guest${added === 1 ? "" : "s"}${skipped.length ? ` · ${skipped.length} skipped` : ""}` : "No guests imported",
    );
  };

  const importContacts = () => {
    let added = 0;
    CONTACTS.forEach(([n, p]) => {
      if (checkDuplicate(eventId, p, n).kind === "ok") {
        addGuest({ eventId, inviterId: viewerId, contactName: n, phone: p, members: [makeMember(n)] });
        added++;
      }
    });
    setImportOpen(false);
    toast[added ? "success" : "error"](added ? `Added ${added} contacts` : "No new contacts to add");
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "gala-guest-list-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MobileShell
      tabs={organizerTabs}
      title="Guest list"
      right={
        <button onClick={() => setAdd(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted" aria-label="Add guest">
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <div className="px-5 pt-2 pb-4 space-y-4">
        <div className="flex gap-2">
          <select
            aria-label="Event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="min-w-0 flex-1 truncate rounded-full border bg-card px-4 py-2.5 text-xs"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <select
            aria-label="Viewing as"
            value={viewerId}
            onChange={(e) => setViewerId(e.target.value)}
            className="min-w-0 flex-1 truncate rounded-full border bg-card px-4 py-2.5 text-xs"
          >
            {inviters.map((i) => (
              <option key={i.id} value={i.id}>{i.id === MAIN_ORGANIZER_ID ? "All guests" : i.name}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-foreground p-5 text-background">
          <p className="text-xs uppercase tracking-widest text-background/60">
            {viewerId === MAIN_ORGANIZER_ID ? "Invitations remaining" : `${inviters.find((i) => i.id === viewerId)?.name} · allowance`}
          </p>
          <p className="mt-1 font-serif text-4xl">{Math.max(allowance.remaining, 0)}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-background/15 pt-3 text-xs">
            <span className="text-background/70">
              <b className="font-serif text-base text-background">{readyCount}</b> ready to invite
            </span>
            <span className="text-background/70">
              <b className="font-serif text-base text-background">{invitedCount}</b> already invited
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setAdd(true)} className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-3 text-sm font-medium hover:bg-muted">
            <UserPlus className="h-4 w-4" /> Add guest
          </button>
          <button onClick={() => setImportOpen(true)} className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-3 text-sm font-medium hover:bg-muted">
            <FileUp className="h-4 w-4" /> Import guests
          </button>
        </div>

        <div className="relative">
          <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or phone"
            className="w-full rounded-full border bg-card py-3 pe-4 ps-11 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
          />
        </div>

        <div className="flex gap-2">
          {(
            [
              ["ready", `Ready ${readyCount}`],
              ["invited", `Invited ${invitedCount}`],
              ["all", "All"],
            ] as [Filter, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${filter === k ? "border-foreground bg-foreground text-background" : "text-muted-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-5 pb-32">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {filter === "invited" ? "No invitations sent yet." : "No guests here yet. Add or import people you want to invite."}
            </p>
          </div>
        )}
        {list.map((g) => (
          <div key={g.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{g.contactName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {g.phone}
                  {g.groupSize > 1 && ` · group of ${g.groupSize}`}
                </p>
                {viewerId === MAIN_ORGANIZER_ID && g.inviterId !== MAIN_ORGANIZER_ID && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Added by {inviters.find((i) => i.id === g.inviterId)?.name}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest ${STATE_STYLE[g.state]}`}>
                  {STATE_LABEL[g.state]}
                </span>
                {g.state === "staged" && (
                  <button onClick={() => { removeGuest(g.id); toast.success("Removed"); }} aria-label={`Remove ${g.contactName}`} className="text-muted-foreground hover:text-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {(g.state === "expired" || g.state === "cancelled") && (
                  <button
                    onClick={() => { restageGuest(g.id); toast.success(`${g.contactName} moved back to ready`); }}
                    aria-label={`Re-invite ${g.contactName}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {g.groupSize > 1 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {g.members.map((m) => (
                  <span key={m.id} className="rounded-full border px-2.5 py-1 text-[11px]">{m.name || "Unnamed"}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-20 px-5">
        <Link
          to="/organizer/send"
          search={{ event: eventId, inviter: viewerId }}
          aria-disabled={!readyCount}
          className={`flex items-center justify-center rounded-full py-4 text-sm font-medium shadow-elegant ${readyCount ? "bg-foreground text-background" : "pointer-events-none bg-muted text-muted-foreground"}`}
        >
          {readyCount ? `Prepare invitations · ${readyCount} ready` : "Add guests to continue"}
        </Link>
      </div>

      {add && <AddSheet onClose={() => setAdd(false)} onAdd={tryAdd} />}

      {importOpen && (
        <Sheet title="Import guests" onClose={() => setImportOpen(false)}>
          <button onClick={importContacts} className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-start hover:bg-muted">
            <BookUser className="h-5 w-5" />
            <span>
              <span className="block text-sm font-medium">From phone contacts</span>
              <span className="block text-xs text-muted-foreground">Duplicates for this event are skipped automatically</span>
            </span>
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-start hover:bg-muted">
            <FileUp className="h-5 w-5" />
            <span>
              <span className="block text-sm font-medium">Upload CSV file</span>
              <span className="block text-xs text-muted-foreground">Name, phone, group size — reviewed before import</span>
            </span>
          </button>
          <button onClick={downloadTemplate} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3 text-xs text-muted-foreground hover:bg-muted">
            <Download className="h-4 w-4" /> Download CSV template
          </button>
        </Sheet>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv,text/plain"
        className="hidden"
        onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }}
      />

      {csv && (
        <CsvSheet {...csv} onClose={() => setCsv(null)} onImport={importCsv} />
      )}

      {confirmDupe && (
        <Dialog
          title="Previously invited"
          body={confirmDupe.message}
          cancelLabel="Cancel"
          confirmLabel="Add and continue"
          onCancel={() => setConfirmDupe(null)}
          onConfirm={() => { confirmDupe.commit(); setConfirmDupe(null); }}
        />
      )}
    </MobileShell>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="max-h-[88%] w-full space-y-3 overflow-y-auto rounded-t-3xl bg-background p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-medium">{title}</p>
          <button onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Dialog({
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={onCancel}>
      <div className="w-full space-y-4 rounded-3xl bg-background p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="font-medium">{title}</p>
        </div>
        <p className="text-sm text-muted-foreground">{body}</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="rounded-full border py-3.5 text-sm font-medium">{cancelLabel}</button>
          <button onClick={onConfirm} className="rounded-full bg-foreground py-3.5 text-sm font-medium text-background">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function AddSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (n: string, p: string, extra: string[]) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+966");
  const [extra, setExtra] = useState<string[]>([]);
  const valid = validatePhone(phone);
  return (
    <Sheet title="Add guest" onClose={onClose}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Guest name" className="w-full rounded-2xl border bg-card px-5 py-3.5 text-sm" />
      <div>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 55 000 0000" inputMode="tel" className="w-full rounded-2xl border bg-card px-5 py-3.5 text-sm" />
        {!valid && phone.length > 3 && <p className="mt-1.5 text-xs text-amber-600">Use international format, e.g. +966550000000</p>}
      </div>

      {extra.length === 0 ? (
        <button onClick={() => setExtra([""])} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium">
          <UserPlus className="h-3.5 w-3.5" /> Invite as a group
        </button>
      ) : (
        <div className="space-y-2 rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            One invitation goes to {name || "the guest"}'s number. Each name below RSVPs separately.
          </p>
          {extra.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={v}
                onChange={(e) => setExtra(extra.map((x, k) => (k === i ? e.target.value : x)))}
                placeholder={`Guest ${i + 2} name`}
                className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm"
              />
              <button onClick={() => setExtra(extra.filter((_, k) => k !== i))} aria-label={`Remove guest ${i + 2}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button onClick={() => setExtra([...extra, ""])} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium">
            <UserPlus className="h-3.5 w-3.5" /> Add person
          </button>
        </div>
      )}

      <button
        onClick={() => { onAdd(name, phone, extra); onClose(); }}
        className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
      >
        Add to guest list
      </button>
    </Sheet>
  );
}

function CsvSheet({
  fileName,
  rows,
  errors,
  total,
  onClose,
  onImport,
}: {
  fileName: string;
  rows: CsvRow[];
  errors: CsvError[];
  total: number;
  onClose: () => void;
  onImport: () => void;
}) {
  return (
    <Sheet title={rows.length ? "Review import" : "Import report"} onClose={onClose}>
      <p className="text-xs text-muted-foreground">{fileName} · {total} row{total === 1 ? "" : "s"} read</p>
      {rows.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Valid</p>
            <p className="mt-1 font-serif text-3xl">{rows.length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Errors</p>
            <p className="mt-1 font-serif text-3xl">{errors.length}</p>
          </div>
        </div>
      )}
      {errors.length > 0 && (
        <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" /> Not imported
          </p>
          <ul className="mt-3 space-y-2">
            {errors.map((e, i) => (
              <li key={`${e.line}-${i}`} className="text-xs text-amber-900 dark:text-amber-200">
                <span className="font-medium">Line {e.line}:</span> {e.reason}
                <p className="truncate font-mono text-[11px] opacity-70">{e.raw}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {rows.length > 0 ? (
        <button onClick={onImport} className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
          Import {rows.length} guest{rows.length === 1 ? "" : "s"}
        </button>
      ) : (
        <button onClick={onClose} className="w-full rounded-full border py-4 text-sm font-medium">Close</button>
      )}
    </Sheet>
  );
}
