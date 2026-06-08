// Simple in-memory store for credit packages.
// Prototype only — no persistence required.
import { useSyncExternalStore } from "react";
import {
  creditPackages as seedPackages,
  type CreditPackage,
} from "./data";

let packages: CreditPackage[] = [...seedPackages];

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => packages;

export function usePackagesStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addPackage(p: CreditPackage) {
  packages = [p, ...packages];
  notify();
}

export function updatePackage(id: string, patch: Partial<CreditPackage>) {
  packages = packages.map((p) => (p.id === id ? { ...p, ...patch } : p));
  notify();
}

export function deletePackage(id: string) {
  packages = packages.filter((p) => p.id !== id);
  notify();
}
