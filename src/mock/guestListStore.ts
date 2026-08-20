// Guest list staging + invitation batch store (prototype, in-memory).
import { useSyncExternalStore } from "react";
import { coInviters, guests as seedGuests, eventById } from "./data";

export type InviteState = "staged" | "sent" | "expired" | "accepted" | "rejected" | "cancelled";

/** One named person inside a group invitation. Each member RSVPs separately. */
export type GroupMember = { id: string; name: string };

export const makeMember = (name: string): GroupMember => ({
  id: `m_${Math.random().toString(36).slice(2, 9)}`,
  name: name.trim(),
});

export type StagedGuest = {
  id: string;
  eventId: string;
  inviterId: string; // "o_self" = main organizer, otherwise co-inviter id
  contactName: string; // imported / contact name
  displayName?: string; // invitation display name (reviewed)
  reviewed: boolean;
  phone: string;
  /** Named party members who RSVP separately. Index 0 is the phone owner (primary contact). */
  members: GroupMember[];
  groupSize: number;
  state: InviteState;
  invitedAt?: string;
  decidedAt?: string;
};

export type SendBatch = {
  id: string;
  eventId: string;
  inviterId: string;
  format: "wedding" | "other";
  language: "en" | "ar";
  count: number;
  sentAt: string;
  expiresAt: string;
  reminderAt: string;
};

export const MAIN_ORGANIZER_ID = "o_self";
export const EXPIRY_HOURS = 72;
export const REMINDER_BEFORE_EXPIRY_HOURS = 24;

export function inviterName(id: string) {
  if (id === MAIN_ORGANIZER_ID) return "You (Organizer)";
  return coInviters.find((c) => c.id === id)?.name ?? id;
}

export function invitersForEvent(eventId: string) {
  return [
    { id: MAIN_ORGANIZER_ID, name: inviterName(MAIN_ORGANIZER_ID), allocated: eventById(eventId)?.creditsTotal ?? 0 },
    ...coInviters.filter((c) => c.eventId === eventId).map((c) => ({ id: c.id, name: c.name, allocated: c.allocated })),
  ];
}

// ---- seed ----
const hours = (n: number) => new Date(Date.now() + n * 3600_000).toISOString();

let staged: StagedGuest[] = seedGuests.slice(0, 40).map((g, i) => {
  const co = coInviters.filter((c) => c.eventId === g.eventId);
  const inviterId = co.length && i % 3 === 2 ? co[i % co.length].id : MAIN_ORGANIZER_ID;
  const state: InviteState =
    g.status === "accepted" || g.status === "checkedin"
      ? "accepted"
      : g.status === "rejected"
        ? "rejected"
        : g.status === "expired"
          ? "expired"
          : g.status === "cancelled"
            ? "cancelled"
            : "sent";
  return {
    id: `sg_${g.id}`,
    eventId: g.eventId,
    inviterId,
    contactName: g.name,
    displayName: undefined,
    reviewed: false,
    phone: g.phone,
    members: Array.from({ length: g.groupSize ?? 1 }, (_, k) => makeMember(k === 0 ? g.name : `Guest ${k + 1}`)),
    groupSize: g.groupSize ?? 1,
    state,
    invitedAt: g.invitedAt,
    decidedAt: g.respondedAt,
  };
});

let batches: SendBatch[] = [];

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useGuestList() {
  return useSyncExternalStore(
    subscribe,
    () => staged,
    () => staged,
  );
}
export function useBatches() {
  return useSyncExternalStore(
    subscribe,
    () => batches,
    () => batches,
  );
}

/** Visibility rule: main organizer sees everything, co-inviters see only their own. */
export function visibleGuests(eventId: string, viewerId: string, all: StagedGuest[] = staged) {
  return all.filter((g) => g.eventId === eventId && (viewerId === MAIN_ORGANIZER_ID || g.inviterId === viewerId));
}

export const normalizePhone = (p: string) => p.replace(/[^\d+]/g, "");

export function validatePhone(p: string) {
  const n = normalizePhone(p);
  return /^\+\d{8,15}$/.test(n);
}

export type DedupeResult =
  | { kind: "ok" }
  | { kind: "confirm"; message: string }
  | { kind: "blocked"; message: string };

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

/** Phone number is the primary dedupe key, scoped to the event. */
export function checkDuplicate(eventId: string, phone: string, name = "This guest"): DedupeResult {
  const key = normalizePhone(phone);
  const match = staged.find((g) => g.eventId === eventId && normalizePhone(g.phone) === key);
  if (!match) return { kind: "ok" };
  const who = inviterName(match.inviterId);
  if (match.state === "accepted" || match.state === "rejected") {
    return {
      kind: "blocked",
      message: `${match.contactName || name} previously ${match.state} the invitation on ${fmt(match.decidedAt ?? match.invitedAt)}.`,
    };
  }
  if (match.state === "expired") {
    return {
      kind: "confirm",
      message: `${match.contactName || name} was previously invited by ${who} on ${fmt(match.invitedAt)}. That invite expired. Confirm if you want to add them to your guest list and resend the invite.`,
    };
  }
  return {
    kind: "blocked",
    message: `${match.contactName || name} already has an active invitation for this event, added by ${who} on ${fmt(match.invitedAt)}.`,
  };
}

export function addGuest(
  g: Omit<StagedGuest, "id" | "state" | "reviewed" | "members" | "groupSize"> & { members?: GroupMember[]; groupSize?: number },
) {
  const members = g.members?.length ? g.members : [makeMember(g.contactName)];
  const guest: StagedGuest = {
    ...g,
    members,
    groupSize: members.length,
    id: `sg_${Math.random().toString(36).slice(2, 9)}`,
    state: "staged",
    reviewed: false,
  };
  staged = [guest, ...staged];
  notify();
  return guest;
}

export function updateGuest(id: string, patch: Partial<StagedGuest>) {
  staged = staged.map((g) =>
    g.id === id ? { ...g, ...patch, groupSize: (patch.members ?? g.members).length } : g,
  );
  notify();
}

/** Rename one named member of a group invitation. */
export function updateMember(guestId: string, memberId: string, name: string) {
  const g = staged.find((x) => x.id === guestId);
  if (!g) return;
  updateGuest(guestId, { members: g.members.map((m) => (m.id === memberId ? { ...m, name } : m)) });
}

export function removeGuest(id: string) {
  staged = staged.filter((g) => g.id !== id);
  notify();
}

export function sendBatch(input: {
  eventId: string;
  inviterId: string;
  format: "wedding" | "other";
  language: "en" | "ar";
  guestIds: string[];
}) {
  const now = new Date().toISOString();
  const batch: SendBatch = {
    id: `b_${Math.random().toString(36).slice(2, 9)}`,
    eventId: input.eventId,
    inviterId: input.inviterId,
    format: input.format,
    language: input.language,
    count: input.guestIds.length,
    sentAt: now,
    expiresAt: hours(EXPIRY_HOURS),
    reminderAt: hours(EXPIRY_HOURS - REMINDER_BEFORE_EXPIRY_HOURS),
  };
  batches = [batch, ...batches];
  staged = staged.map((g) => (input.guestIds.includes(g.id) ? { ...g, state: "sent", invitedAt: now } : g));
  notify();
  return batch;
}

export function remainingAllowance(eventId: string, inviterId: string) {
  if (inviterId === MAIN_ORGANIZER_ID) {
    const ev = eventById(eventId);
    const used = staged.filter((g) => g.eventId === eventId && g.inviterId === inviterId && g.state !== "staged").length;
    return { allocated: ev?.creditsTotal ?? 0, used, remaining: (ev?.creditsTotal ?? 0) - used };
  }
  const co = coInviters.find((c) => c.id === inviterId);
  const used = staged.filter((g) => g.eventId === eventId && g.inviterId === inviterId && g.state !== "staged").length;
  return { allocated: co?.allocated ?? 0, used, remaining: (co?.allocated ?? 0) - used };
}

/** Look up a staged guest (used by the invitee page to read named group members). */
export function stagedById(id: string) {
  return staged.find((g) => g.id === id || g.id === `sg_${id}`);
}
