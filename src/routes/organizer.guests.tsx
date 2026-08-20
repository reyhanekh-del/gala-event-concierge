import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/gala/MobileShell";
import { organizerTabs } from "@/components/gala/organizerTabs";
import { useMemo, useRef, useState } from "react";
import { CSV_TEMPLATE, parseGuestCsv, type CsvError, type CsvRow } from "@/lib/csvGuests";
import { events } from "@/mock/data";
import {
  MAIN_ORGANIZER_ID,
  addGuest,
  checkDuplicate,
  invitersForEvent,
  remainingAllowance,
  removeGuest,
  useGuestList,
  validatePhone,
  visibleGuests,
  type StagedGuest,
} from "@/mock/guestListStore";
import { toast } from "sonner";
import { AlertTriangle, BookUser, Download, FileUp, Plus, Search, Trash2, Users, X } from "lucide-react";

export const Route = createFileRoute("/organizer/guests")({
  component: GuestList,
  head: () => ({
    meta: [
      { title: "Guest list staging | Gala Organizer" },
      { name: "description", content: "Prepare your full event guest list before sending invitations." },
      { property: "og:title", content: "Guest list staging | Gala Organizer" },
      { property: "og:description", content: "Stage, validate and organise guests before sending invitations." },
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

const STATE_STYLE: Record<StagedGuest["state"], string> = {
  staged: "bg-muted text-muted-foreground",
  sent: "bg-foreground text-background",
  expired: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  accepted: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  rejected: "bg-muted text-muted-foreground line-through",
  cancelled: "bg-muted text-muted-foreground line-through",
};

function GuestList() {
  const upcoming = events.filter((e) => e.status === "upcoming");
  const [eventId, setEventId] = useState(upcoming[0]?.id ?? events[0].id);
  const [viewerId, setViewerId] = useState(MAIN_ORGANIZER_ID);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState<{ fileName: string; rows: CsvRow[]; errors: CsvError[]; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const all = useGuestList();

  const inviters = invitersForEvent(eventId);
  const list = useMemo(
    () =>
      visibleGuests(eventId, viewerId, all).filter(
        (g) => g.contactName.toLowerCase().includes(q.toLowerCase()) || g.phone.includes(q),
      ),
    [all, eventId, viewerId, q],
  );
  const stagedCount = list.filter((g) => g.state === "staged").length;
  const allowance = remainingAllowance(eventId, viewerId);

  const tryAdd = (name: string, phone: string, extraNames: string[] = []) => {
    if (!name.trim()) return toast.error("Guest name is required");
    if (!validatePhone(phone)) return toast.error("Enter a valid international phone number, e.g. +96650…");
    const names = [name.trim(), ...extraNames.map((n) => n.trim()).filter(Boolean)];
    const members = names.map(makeMember);
    const dupe = checkDuplicate(eventId, phone, name);
    if (dupe.kind === "blocked") return toast.error(dupe.message);
    const commit = () => addGuest({ eventId, inviterId: viewerId, contactName: name.trim(), phone, members });
    if (dupe.kind === "confirm") {
      toast(dupe.message, {
        duration: 12000,
        action: {
          label: "Add & resend",
          onClick: () => {
            commit();
            toast.success(`${name} added to the staged guest list`);
          },
        },
      });
      return;
    }
    commit();
    toast.success(members.length > 1 ? `${name} + ${members.length - 1} named guests staged` : `${name} staged`);
  };

  const onFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) {
      toast.error("Please choose a .csv file");
      return;
    }
    if (file.size > 1_000_000) {
      toast.error("File is too large (max 1 MB)");
      return;
    }
    const text = await file.text();
    const parsed = parseGuestCsv(text);
    if (!parsed.total) {
      toast.error("No guest rows found in this file");
      return;
    }
    setCsv({ fileName: file.name, ...parsed });
  };

  const importCsv = () => {
    if (!csv) return;
    let added = 0;
    const skipped: CsvError[] = [];
    csv.rows.forEach((r) => {
      const dupe = checkDuplicate(eventId, r.phone, r.name);
      if (dupe.kind === "ok" || dupe.kind === "confirm") {
        addGuest({ eventId, inviterId: viewerId, contactName: r.name, phone: r.phone, groupSize: r.groupSize });
        added++;
      } else {
        skipped.push({ line: r.line, raw: `${r.name}, ${r.phone}`, reason: dupe.message });
      }
    });
    setCsv(null);
    if (skipped.length) {
      setCsv({ fileName: "Skipped rows", rows: [], errors: skipped, total: skipped.length });
    }
    toast[added ? "success" : "error"](
      added ? `Imported ${added} guest${added === 1 ? "" : "s"}${skipped.length ? ` · ${skipped.length} skipped` : ""}` : "No guests imported",
    );
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
        <button onClick={() => setOpen(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted" aria-label="Add guest">
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <div className="px-5 pt-2 pb-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Prepare the full guest list first. Nothing is sent until you run an invitation batch.
        </p>

        <div className="grid grid-cols-1 gap-2">
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="w-full rounded-2xl border bg-card px-5 py-3.5 text-sm">
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <select value={viewerId} onChange={(e) => setViewerId(e.target.value)} className="w-full rounded-2xl border bg-card px-5 py-3.5 text-sm">
            {inviters.map((i) => (
              <option key={i.id} value={i.id}>Viewing as {i.name}</option>
            ))}
          </select>
        </div>

        {viewerId !== MAIN_ORGANIZER_ID && (
          <p className="rounded-2xl border border-dashed p-3 text-xs text-muted-foreground">
            Co-inviter view: only this co-inviter's own staged guests, sent invites and allowance are visible.
          </p>
        )}

        <div className="rounded-2xl bg-foreground text-background p-5">
          <p className="text-xs uppercase tracking-widest text-background/60">Invite allowance</p>
          <p className="font-serif text-3xl mt-1">{Math.max(allowance.remaining, 0)} left</p>
          <p className="text-xs text-background/60 mt-1">{allowance.used} used of {allowance.allocated} allocated · {stagedCount} staged, not yet sent</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-3 text-sm font-medium hover:bg-muted">
            <Plus className="h-4 w-4" /> Add manually
          </button>
          <button
            onClick={() => {
              let added = 0;
              CONTACTS.forEach(([n, p]) => {
                if (checkDuplicate(eventId, p, n).kind === "ok") {
                  addGuest({ eventId, inviterId: viewerId, contactName: n, phone: p, groupSize: 1 });
                  added++;
                }
              });
              toast.success(added ? `Imported ${added} contacts` : "No new contacts to import");
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-3 text-sm font-medium hover:bg-muted"
          >
            <BookUser className="h-4 w-4" /> Import contacts
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-3 text-sm font-medium hover:bg-muted"
          >
            <FileUp className="h-4 w-4" /> Import CSV
          </button>
          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed py-3 text-sm text-muted-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4" /> CSV template
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            className="hidden"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone" className="w-full rounded-full border bg-card ps-11 pe-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/10" />
        </div>
      </div>

      <div className="px-5 pb-32 space-y-2">
        {list.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No guests staged yet.</p>}
        {list.map((g) => (
          <div key={g.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{g.contactName}</p>
                <p className="text-xs text-muted-foreground">{g.phone}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${STATE_STYLE[g.state]}`}>{g.state}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {g.groupSize > 1 ? `Group of ${g.groupSize}` : "Individual"}
                {viewerId === MAIN_ORGANIZER_ID && <span className="ms-2">· by {inviters.find((i) => i.id === g.inviterId)?.name ?? g.inviterId}</span>}
              </span>
              {g.state === "staged" && (
                <button onClick={() => { removeGuest(g.id); toast.success("Removed"); }} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-20 inset-x-0 px-5">
        <Link
          to="/organizer/send"
          search={{ event: eventId, inviter: viewerId }}
          className={`flex items-center justify-center rounded-full py-4 text-sm font-medium shadow-elegant ${stagedCount ? "bg-foreground text-background" : "pointer-events-none bg-muted text-muted-foreground"}`}
        >
          Prepare invitations ({stagedCount} ready)
        </Link>
      </div>

      {open && <AddSheet onClose={() => setOpen(false)} onAdd={tryAdd} />}
      {csv && (
        <CsvSheet
          fileName={csv.fileName}
          rows={csv.rows}
          errors={csv.errors}
          total={csv.total}
          onClose={() => setCsv(null)}
          onImport={importCsv}
        />
      )}
    </MobileShell>
  );
}

function AddSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (n: string, p: string, g: number) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+966");
  const [group, setGroup] = useState(1);
  const valid = validatePhone(phone);
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="w-full rounded-t-3xl bg-background p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-medium">Add guest</p>
          <button onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contact name" className="w-full rounded-2xl border bg-card px-5 py-3.5 text-sm" />
        <div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 55 000 0000" inputMode="tel" className="w-full rounded-2xl border bg-card px-5 py-3.5 text-sm" />
          {!valid && phone.length > 3 && <p className="mt-1.5 text-xs text-amber-600">Use international format, e.g. +966550000000</p>}
        </div>
        <div className="flex items-center justify-between rounded-2xl border bg-card px-5 py-3">
          <span className="text-sm">Group size</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setGroup(Math.max(1, group - 1))} className="h-8 w-8 rounded-full border">−</button>
            <span className="w-6 text-center text-sm font-medium">{group}</span>
            <button onClick={() => setGroup(group + 1)} className="h-8 w-8 rounded-full border">+</button>
          </div>
        </div>
        <button
          onClick={() => { onAdd(name, phone, group); setName(""); setPhone("+966"); setGroup(1); onClose(); }}
          className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background"
        >
          Add to guest list
        </button>
      </div>
    </div>
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
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="w-full max-h-[85%] overflow-y-auto rounded-t-3xl bg-background p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-medium truncate">{rows.length ? "Review CSV import" : "Import report"}</p>
            <p className="text-xs text-muted-foreground truncate">{fileName} · {total} row{total === 1 ? "" : "s"} read</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Valid</p>
            <p className="font-serif text-3xl mt-1">{rows.length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Errors</p>
            <p className="font-serif text-3xl mt-1">{errors.length}</p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" /> Rows not imported
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

        {rows.length > 0 && (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.line} className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.phone}</p>
                </div>
                <span className="text-xs text-muted-foreground">{r.groupSize > 1 ? `Group of ${r.groupSize}` : "Individual"}</span>
              </div>
            ))}
          </div>
        )}

        {rows.length > 0 ? (
          <button onClick={onImport} className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
            Add {rows.length} guest{rows.length === 1 ? "" : "s"} to list
          </button>
        ) : (
          <button onClick={onClose} className="w-full rounded-full border py-4 text-sm font-medium">
            Close
          </button>
        )}
      </div>
    </div>
  );
}
