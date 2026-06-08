// Simple in-memory store for venues, organizers, transactions per venue.
// Seeded from mock data. Prototype only — no persistence required.
import { useSyncExternalStore } from "react";
import {
  venues as seedVenues,
  organizers as seedOrganizers,
  events as seedEvents,
  transactions as seedTransactions,
  type Venue,
  type Organizer,
  type Transaction,
} from "./data";

export type VenueManager = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Owner" | "Manager" | "Coordinator";
};

type State = {
  venues: Venue[];
  managers: Record<string, VenueManager[]>;
  transactions: Record<string, Transaction[]>;
};

const seedManagers: Record<string, VenueManager[]> = {
  v_ritz: [
    { id: "m_1", name: "Amal Al-Saud", email: "amal@ritz.com", phone: "+966 50 123 4567", role: "Owner" },
  ],
  v_addr: [
    { id: "m_2", name: "Khalid Al-Mansoori", email: "khalid@addr.com", phone: "+971 50 987 6543", role: "Manager" },
  ],
  v_four: [
    { id: "m_3", name: "Noor Al-Thani", email: "noor@fs.com", phone: "+974 33 222 1100", role: "Owner" },
  ],
};

const seedVenueTx: Record<string, Transaction[]> = {
  v_ritz: seedTransactions.slice(0, 4),
  v_addr: seedTransactions.slice(2, 6),
  v_four: seedTransactions.slice(1, 4),
};

let state: State = {
  venues: [...seedVenues],
  managers: { ...seedManagers },
  transactions: { ...seedVenueTx },
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function useVenuesStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getVenue(id: string) {
  return state.venues.find((v) => v.id === id);
}
export function getVenueManagers(id: string): VenueManager[] {
  return state.managers[id] ?? [];
}
export function getVenueTransactions(id: string): Transaction[] {
  return state.transactions[id] ?? [];
}
export function getVenueOrganizers(id: string): Organizer[] {
  return seedOrganizers.filter((o) => o.venueId === id);
}
export function getVenueEvents(id: string) {
  return seedEvents.filter((e) => e.venueId === id);
}

export function addVenue(v: Venue) {
  state = { ...state, venues: [v, ...state.venues] };
  notify();
}
export function updateVenue(id: string, patch: Partial<Venue>) {
  state = {
    ...state,
    venues: state.venues.map((v) => (v.id === id ? { ...v, ...patch } : v)),
  };
  notify();
}
export function addVenueManager(venueId: string, m: VenueManager) {
  state = {
    ...state,
    managers: {
      ...state.managers,
      [venueId]: [...(state.managers[venueId] ?? []), m],
    },
  };
  notify();
}
