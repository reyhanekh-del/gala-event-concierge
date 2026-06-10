// Admin user + role management store. Mock-only.
import { useSyncExternalStore } from "react";

export type Permission =
  | "venues.manage"
  | "organizers.manage"
  | "events.manage"
  | "packages.manage"
  | "revenue.view"
  | "audit.view"
  | "users.manage"
  | "support.manage";

export const ALL_PERMISSIONS: { key: Permission; label: string }[] = [
  { key: "venues.manage", label: "Manage venues" },
  { key: "organizers.manage", label: "Manage organizers" },
  { key: "events.manage", label: "Manage events" },
  { key: "packages.manage", label: "Manage credit packages" },
  { key: "revenue.view", label: "View revenue" },
  { key: "audit.view", label: "View audit logs" },
  { key: "users.manage", label: "Manage admins & roles" },
  { key: "support.manage", label: "Handle support tickets" },
];

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  system?: boolean;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  status: "active" | "invited" | "suspended";
  lastActive: string; // ISO
};

type State = { roles: Role[]; users: AdminUser[] };

const seedRoles: Role[] = [
  {
    id: "r_super",
    name: "Super Admin",
    description: "Full access to every part of Gala Admin.",
    permissions: ALL_PERMISSIONS.map((p) => p.key),
    system: true,
  },
  {
    id: "r_ops",
    name: "Operations",
    description: "Day-to-day management of venues, organizers and events.",
    permissions: ["venues.manage", "organizers.manage", "events.manage", "support.manage"],
  },
  {
    id: "r_finance",
    name: "Finance",
    description: "Read-only access to revenue and credit package settings.",
    permissions: ["packages.manage", "revenue.view", "audit.view"],
  },
  {
    id: "r_support",
    name: "Support",
    description: "Handle support tickets and view audit logs.",
    permissions: ["support.manage", "audit.view"],
  },
];

const seedUsers: AdminUser[] = [
  {
    id: "u_root",
    name: "Sarah Lin",
    email: "sarah@gala.app",
    phone: "+1 415 555 0101",
    roleId: "r_super",
    status: "active",
    lastActive: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "u_ops",
    name: "Yousef Al-Mutairi",
    email: "yousef@gala.app",
    phone: "+966 53 444 5566",
    roleId: "r_ops",
    status: "active",
    lastActive: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id: "u_fin",
    name: "Hessa Al-Maktoum",
    email: "hessa@gala.app",
    phone: "+971 56 778 9900",
    roleId: "r_finance",
    status: "active",
    lastActive: new Date(Date.now() - 2 * 86400_000).toISOString(),
  },
  {
    id: "u_sup",
    name: "Omar Bin Sultan",
    email: "omar@gala.app",
    phone: "+971 55 443 2211",
    roleId: "r_support",
    status: "invited",
    lastActive: new Date(Date.now() - 5 * 86400_000).toISOString(),
  },
];

let state: State = { roles: seedRoles, users: seedUsers };

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function useAdminUsersStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getRole(id: string) {
  return state.roles.find((r) => r.id === id);
}

export function addAdmin(u: Omit<AdminUser, "id" | "lastActive" | "status"> & { status?: AdminUser["status"] }) {
  const next: AdminUser = {
    ...u,
    id: `u_${Date.now()}`,
    status: u.status ?? "invited",
    lastActive: new Date().toISOString(),
  };
  state = { ...state, users: [next, ...state.users] };
  notify();
  return next;
}

export function updateAdmin(id: string, patch: Partial<AdminUser>) {
  state = { ...state, users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) };
  notify();
}

export function removeAdmin(id: string) {
  state = { ...state, users: state.users.filter((u) => u.id !== id) };
  notify();
}

export function addRole(r: Omit<Role, "id">) {
  const next: Role = { ...r, id: `r_${Date.now()}` };
  state = { ...state, roles: [...state.roles, next] };
  notify();
  return next;
}

export function updateRole(id: string, patch: Partial<Omit<Role, "id" | "system">>) {
  state = {
    ...state,
    roles: state.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  };
  notify();
}

export function removeRole(id: string) {
  const role = state.roles.find((r) => r.id === id);
  if (!role || role.system) return;
  // Reassign users on this role to the first remaining role.
  const fallback = state.roles.find((r) => r.id !== id);
  state = {
    ...state,
    roles: state.roles.filter((r) => r.id !== id),
    users: state.users.map((u) => (u.roleId === id && fallback ? { ...u, roleId: fallback.id } : u)),
  };
  notify();
}
