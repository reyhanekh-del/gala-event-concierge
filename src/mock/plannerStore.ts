// Event Planner store. Mock-only, in-memory + reactive.
// A planner works across many locations: saved locations (reusable) or
// one-time locations attached to a single event.
import { useSyncExternalStore } from "react";

export type PlannerLocation = {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  notes?: string;
  createdAt: string; // ISO
};

export type PlannerEventLocation =
  | { kind: "saved"; locationId: string }
  | { kind: "one-time"; name: string; city: string; address: string; capacity?: number };

export type PlannerEvent = {
  id: string;
  name: string;
  host: string;
  date: string; // ISO
  time: string; // HH:mm
  cover: string;
  status: "upcoming" | "live" | "past" | "cancelled";
  expectedGuests: number;
  confirmed: number;
  checkedIn: number;
  creditsAllocated: number;
  creditsUsed: number;
  scannerPin: string;
  location: PlannerEventLocation;
};

export type PlannerTransaction = {
  id: string;
  date: string;
  type: "purchase" | "allocation" | "invite" | "refund";
  description: string;
  amount: number;
};

export type Planner = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  creditsPurchased: number;
};

type State = {
  planner: Planner;
  locations: PlannerLocation[];
  events: PlannerEvent[];
  transactions: PlannerTransaction[];
};

const iso = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 86400000).toISOString();

const seedLocations: PlannerLocation[] = [
  {
    id: "pl_ballroom",
    name: "Grand Ballroom, Ritz-Carlton",
    city: "Riyadh",
    address: "Al Hada, Mekkah Al Mukarramah Branch Rd, Riyadh 12211",
    capacity: 600,
    notes: "Two service entrances. Valet closes at 01:00.",
    createdAt: iso(-160),
  },
  {
    id: "pl_marina",
    name: "Marina Terrace",
    city: "Dubai",
    address: "Address Dubai Marina, Sheikh Zayed Rd, Dubai",
    capacity: 240,
    notes: "Outdoor — needs a weather contingency in summer.",
    createdAt: iso(-120),
  },
  {
    id: "pl_pearl",
    name: "The Pearl Pavilion",
    city: "Doha",
    address: "Porto Arabia, The Pearl Island, Doha",
    capacity: 180,
    createdAt: iso(-64),
  },
  {
    id: "pl_studio",
    name: "Al-Balad Courtyard",
    city: "Jeddah",
    address: "Historic Jeddah, Al-Balad District, Jeddah",
    capacity: 120,
    notes: "Heritage site — no fixed rigging allowed.",
    createdAt: iso(-30),
  },
];

const seedEvents: PlannerEvent[] = [
  {
    id: "pe_charity",
    name: "Autumn Charity Gala",
    host: "Al-Saud Foundation",
    date: iso(12),
    time: "20:00",
    cover: "onyx",
    status: "upcoming",
    expectedGuests: 480,
    confirmed: 312,
    checkedIn: 0,
    creditsAllocated: 600,
    creditsUsed: 344,
    scannerPin: "418702",
    location: { kind: "saved", locationId: "pl_ballroom" },
  },
  {
    id: "pe_launch",
    name: "Aurum Watch Launch",
    host: "Aurum Maison",
    date: iso(5),
    time: "19:30",
    cover: "graphite",
    status: "upcoming",
    expectedGuests: 180,
    confirmed: 121,
    checkedIn: 0,
    creditsAllocated: 220,
    creditsUsed: 140,
    scannerPin: "552910",
    location: { kind: "saved", locationId: "pl_marina" },
  },
  {
    id: "pe_desert",
    name: "Desert Dinner for Vaultline",
    host: "Vaultline Capital",
    date: iso(2),
    time: "18:00",
    cover: "smoke",
    status: "upcoming",
    expectedGuests: 90,
    confirmed: 74,
    checkedIn: 0,
    creditsAllocated: 120,
    creditsUsed: 88,
    scannerPin: "770134",
    location: {
      kind: "one-time",
      name: "Nefud Dune Camp",
      city: "Al-Ula",
      address: "Sharaan Reserve access road, Al-Ula",
      capacity: 100,
    },
  },
  {
    id: "pe_pearl",
    name: "Al-Thani Engagement",
    host: "Al-Thani Family",
    date: iso(-9),
    time: "21:00",
    cover: "ivory",
    status: "past",
    expectedGuests: 160,
    confirmed: 148,
    checkedIn: 132,
    creditsAllocated: 200,
    creditsUsed: 160,
    scannerPin: "301884",
    location: { kind: "saved", locationId: "pl_pearl" },
  },
  {
    id: "pe_courtyard",
    name: "Heritage Ramadan Majlis",
    host: "Jeddah Cultural Trust",
    date: iso(-34),
    time: "22:00",
    cover: "pearl",
    status: "past",
    expectedGuests: 110,
    confirmed: 98,
    checkedIn: 91,
    creditsAllocated: 140,
    creditsUsed: 112,
    scannerPin: "129047",
    location: { kind: "saved", locationId: "pl_studio" },
  },
];

const seedTransactions: PlannerTransaction[] = [
  { id: "pt_1", date: iso(-1), type: "invite", description: "Invitations sent · Autumn Charity Gala", amount: -120 },
  { id: "pt_2", date: iso(-3), type: "allocation", description: "Allocated to Aurum Watch Launch", amount: -220 },
  { id: "pt_3", date: iso(-6), type: "refund", description: "Expired invitations returned · Desert Dinner", amount: 14 },
  { id: "pt_4", date: iso(-11), type: "purchase", description: "Purchased Growth pack", amount: 1500 },
  { id: "pt_5", date: iso(-21), type: "invite", description: "Invitations sent · Al-Thani Engagement", amount: -160 },
  { id: "pt_6", date: iso(-40), type: "purchase", description: "Purchased Starter pack", amount: 500 },
];

let state: State = {
  planner: {
    id: "p_studio",
    name: "Reyhane Karimi",
    company: "Studio Meridian Events",
    phone: "+971 55 210 8844",
    email: "reyhane@studiomeridian.com",
    creditsPurchased: 2600,
  },
  locations: seedLocations,
  events: seedEvents,
  transactions: seedTransactions,
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function usePlannerStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getPlannerState() {
  return state;
}

export function getPlannerLocation(id: string) {
  return state.locations.find((l) => l.id === id);
}

export function getPlannerEvent(id: string) {
  return state.events.find((e) => e.id === id);
}

/** Resolves either a saved or one-time location into displayable fields. */
export function resolveEventLocation(e: PlannerEvent) {
  if (e.location.kind === "saved") {
    const l = getPlannerLocation(e.location.locationId);
    return {
      kind: "saved" as const,
      name: l?.name ?? "Removed location",
      city: l?.city ?? "—",
      address: l?.address ?? "—",
      capacity: l?.capacity,
      locationId: e.location.locationId,
    };
  }
  return {
    kind: "one-time" as const,
    name: e.location.name,
    city: e.location.city,
    address: e.location.address,
    capacity: e.location.capacity,
    locationId: undefined,
  };
}

export function eventsAtLocation(locationId: string) {
  return state.events.filter(
    (e) => e.location.kind === "saved" && e.location.locationId === locationId,
  );
}

export function plannerCredits() {
  const allocated = state.events.reduce((s, e) => s + e.creditsAllocated, 0);
  const used = state.events.reduce((s, e) => s + e.creditsUsed, 0);
  return {
    purchased: state.planner.creditsPurchased,
    allocated,
    used,
    available: state.planner.creditsPurchased - allocated,
  };
}

// ---- Mutations ----

export function addLocation(l: Omit<PlannerLocation, "id" | "createdAt">) {
  const next: PlannerLocation = { ...l, id: `pl_${Date.now()}`, createdAt: new Date().toISOString() };
  state = { ...state, locations: [next, ...state.locations] };
  notify();
  return next;
}

export function updateLocation(id: string, patch: Partial<Omit<PlannerLocation, "id">>) {
  state = {
    ...state,
    locations: state.locations.map((l) => (l.id === id ? { ...l, ...patch } : l)),
  };
  notify();
}

export function removeLocation(id: string) {
  if (eventsAtLocation(id).length > 0) return false;
  state = { ...state, locations: state.locations.filter((l) => l.id !== id) };
  notify();
  return true;
}

export function addEvent(e: Omit<PlannerEvent, "id" | "confirmed" | "checkedIn" | "creditsUsed" | "scannerPin" | "status"> & {
  status?: PlannerEvent["status"];
}) {
  const next: PlannerEvent = {
    ...e,
    id: `pe_${Date.now()}`,
    status: e.status ?? "upcoming",
    confirmed: 0,
    checkedIn: 0,
    creditsUsed: 0,
    scannerPin: String(Math.floor(100000 + Math.random() * 899999)),
  };
  state = { ...state, events: [next, ...state.events] };
  notify();
  return next;
}

export function updateEvent(id: string, patch: Partial<Omit<PlannerEvent, "id">>) {
  state = {
    ...state,
    events: state.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  };
  notify();
}

/** Promote a one-time location into the planner's saved location book. */
export function saveOneTimeLocation(eventId: string) {
  const e = getPlannerEvent(eventId);
  if (!e || e.location.kind !== "one-time") return null;
  const saved = addLocation({
    name: e.location.name,
    city: e.location.city,
    address: e.location.address,
    capacity: e.location.capacity ?? e.expectedGuests,
  });
  updateEvent(eventId, { location: { kind: "saved", locationId: saved.id } });
  return saved;
}
