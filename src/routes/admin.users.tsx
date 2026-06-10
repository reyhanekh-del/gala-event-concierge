import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, UserPlus, Shield, Pencil, Trash2, Check, X, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, StatCard } from "@/components/gala/Primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useAdminUsersStore, getRole, addAdmin, updateAdmin, removeAdmin,
  addRole, updateRole, removeRole, ALL_PERMISSIONS,
  type AdminUser, type Role, type Permission,
} from "@/mock/adminUsersStore";

function UsersPage() {
  const { users, roles } = useAdminUsersStore();
  const [userOpen, setUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  return (
    <div>
      <SectionHeader
        title="Admin users"
        subtitle="Invite teammates and define what they can do"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditingRole(null); setRoleOpen(true); }}>
              <Shield /> New role
            </Button>
            <Button onClick={() => { setEditingUser(null); setUserOpen(true); }}>
              <UserPlus /> Add admin
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total admins" value={users.length} />
        <StatCard label="Active" value={users.filter((u) => u.status === "active").length} />
        <StatCard label="Pending invites" value={users.filter((u) => u.status === "invited").length} />
        <StatCard label="Roles" value={roles.length} />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <div className="rounded-2xl border bg-card overflow-hidden">
            {users.map((u) => {
              const role = getRole(u.roleId);
              return (
                <div key={u.id} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted font-serif">
                    {u.name[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email} · {u.phone}</p>
                  </div>
                  <Badge variant="outline">{role?.name ?? "—"}</Badge>
                  <StatusBadge status={u.status} />
                  <p className="text-xs text-muted-foreground hidden md:block w-32 text-end">
                    {new Date(u.lastActive).toLocaleDateString()}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingUser(u); setUserOpen(true); }}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      {u.status === "active" ? (
                        <DropdownMenuItem onClick={() => { updateAdmin(u.id, { status: "suspended" }); toast.success(`${u.name} suspended`); }}>
                          <X className="h-4 w-4 mr-2" /> Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => { updateAdmin(u.id, { status: "active" }); toast.success(`${u.name} activated`); }}>
                          <Check className="h-4 w-4 mr-2" /> Activate
                        </DropdownMenuItem>
                      )}
                      {u.status === "invited" && (
                        <DropdownMenuItem onClick={() => toast.success(`Invitation resent to ${u.email}`)}>
                          Resend invite
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => { removeAdmin(u.id); toast.success(`${u.name} removed`); }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((r) => {
              const memberCount = users.filter((u) => u.roleId === r.id).length;
              return (
                <div key={r.id} className="rounded-2xl border bg-card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-xl">{r.name}</h3>
                        {r.system && <Badge variant="secondary">System</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingRole(r); setRoleOpen(true); }}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit role
                        </DropdownMenuItem>
                        {!r.system && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => { removeRole(r.id); toast.success(`${r.name} removed`); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete role
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {r.permissions.length === 0 && (
                      <span className="text-xs text-muted-foreground">No permissions</span>
                    )}
                    {r.permissions.map((p) => (
                      <Badge key={p} variant="outline" className="font-normal">
                        {ALL_PERMISSIONS.find((x) => x.key === p)?.label ?? p}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">{memberCount} member{memberCount === 1 ? "" : "s"}</p>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <AdminDialog
        key={editingUser?.id ?? "new-user"}
        open={userOpen}
        onOpenChange={setUserOpen}
        roles={roles}
        editing={editingUser}
      />
      <RoleDialog
        key={editingRole?.id ?? "new-role"}
        open={roleOpen}
        onOpenChange={setRoleOpen}
        editing={editingRole}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: AdminUser["status"] }) {
  const map = {
    active: { label: "Active", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    invited: { label: "Invited", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    suspended: { label: "Suspended", cls: "bg-rose-500/10 text-rose-700 dark:text-rose-400" },
  } as const;
  const m = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest ${m.cls}`}>
      {m.label}
    </span>
  );
}

function AdminDialog({
  open, onOpenChange, roles, editing,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  roles: Role[]; editing: AdminUser | null;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [roleId, setRoleId] = useState(editing?.roleId ?? roles[0]?.id ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !roleId) {
      toast.error("Name, email and role are required");
      return;
    }
    if (editing) {
      updateAdmin(editing.id, { name: name.trim(), email: email.trim(), phone: phone.trim(), roleId });
      toast.success(`${name} updated`);
    } else {
      addAdmin({ name: name.trim(), email: email.trim(), phone: phone.trim(), roleId });
      toast.success(`Invitation sent to ${email}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit admin" : "Add admin"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update this admin's details and role." : "Invite a teammate to Gala Admin and assign a role."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="a-name">Full name</Label>
            <Input id="a-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-email">Email</Label>
            <Input id="a-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-phone">Phone</Label>
            <Input id="a-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 50 000 0000" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">
              {editing ? <><Check /> Save changes</> : <><UserPlus /> Send invite</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleDialog({
  open, onOpenChange, editing,
}: { open: boolean; onOpenChange: (o: boolean) => void; editing: Role | null }) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [perms, setPerms] = useState<Permission[]>(editing?.permissions ?? []);

  const toggle = (p: Permission, on: boolean) => {
    setPerms((prev) => (on ? Array.from(new Set([...prev, p])) : prev.filter((x) => x !== p)));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (editing) {
      updateRole(editing.id, { name: name.trim(), description: description.trim(), permissions: perms });
      toast.success(`${name} updated`);
    } else {
      addRole({ name: name.trim(), description: description.trim(), permissions: perms });
      toast.success(`${name} role created`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit role" : "New role"}</DialogTitle>
          <DialogDescription>
            Choose what people with this role are allowed to do in Gala Admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="r-name">Role name</Label>
            <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus
              disabled={editing?.system} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-desc">Description</Label>
            <Textarea id="r-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="rounded-xl border divide-y">
              {ALL_PERMISSIONS.map((p) => {
                const checked = perms.includes(p.key);
                return (
                  <label key={p.key} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => toggle(p.key, Boolean(v))}
                      disabled={editing?.system}
                    />
                    <span className="text-sm">{p.label}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">{p.key}</span>
                  </label>
                );
              })}
            </div>
            {editing?.system && (
              <p className="text-xs text-muted-foreground">System roles cannot be modified.</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={editing?.system}>
              {editing ? <><Check /> Save role</> : <><Plus /> Create role</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});
