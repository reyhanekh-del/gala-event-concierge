import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/gala/Primitives";
import { usePackagesStore, addPackage, updatePackage } from "@/mock/packageStore";
import type { CreditPackage } from "@/mock/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

function PackagesPage() {
  const packages = usePackagesStore();

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCredits, setCreateCredits] = useState("");
  const [createPrice, setCreatePrice] = useState("");
  const [createPopular, setCreatePopular] = useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editPackage, setEditPackage] = useState<CreditPackage | null>(null);
  const [editName, setEditName] = useState("");
  const [editCredits, setEditCredits] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPopular, setEditPopular] = useState(false);

  const resetCreate = () => {
    setCreateName("");
    setCreateCredits("");
    setCreatePrice("");
    setCreatePopular(false);
  };

  const openEdit = (pkg: CreditPackage) => {
    setEditPackage(pkg);
    setEditName(pkg.name);
    setEditCredits(String(pkg.credits));
    setEditPrice(String(pkg.priceUsd));
    setEditPopular(pkg.popular ?? false);
    setEditOpen(true);
  };

  const resetEdit = () => {
    setEditPackage(null);
    setEditName("");
    setEditCredits("");
    setEditPrice("");
    setEditPopular(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createCredits.trim() || !createPrice.trim()) {
      toast.error("Name, credits and price are required");
      return;
    }
    const newPkg: CreditPackage = {
      id: `p_${Date.now()}`,
      name: createName.trim(),
      credits: Number(createCredits) || 0,
      priceUsd: Number(createPrice) || 0,
      popular: createPopular,
    };
    addPackage(newPkg);
    toast.success(`${newPkg.name} package created`);
    resetCreate();
    setCreateOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPackage) return;
    if (!editName.trim() || !editCredits.trim() || !editPrice.trim()) {
      toast.error("Name, credits and price are required");
      return;
    }
    updatePackage(editPackage.id, {
      name: editName.trim(),
      credits: Number(editCredits) || 0,
      priceUsd: Number(editPrice) || 0,
      popular: editPopular,
    });
    toast.success(`${editName.trim()} updated`);
    resetEdit();
    setEditOpen(false);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <SectionHeader title="Credit packages" subtitle="What organizers & venues can buy" />
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus /> Add package
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {packages.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {p.name}{p.popular && " · Popular"}
            </p>
            <p className="font-serif text-4xl mt-2">{p.credits.toLocaleString()}</p>
            <p className="font-serif text-xl mt-4">${p.priceUsd}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-xs underline text-muted-foreground"
              onClick={() => openEdit(p)}
            >
              <Pencil className="mr-1 h-3 w-3" /> Edit
            </Button>
          </div>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetCreate(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add package</DialogTitle>
            <DialogDescription>Create a new credit package for organizers and venues.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pkg-name">Package name</Label>
              <Input id="pkg-name" placeholder="Starter" value={createName} onChange={(e) => setCreateName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-credits">Credits</Label>
              <Input id="pkg-credits" type="number" min="0" placeholder="500" value={createCredits} onChange={(e) => setCreateCredits(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-price">Price (USD)</Label>
              <Input id="pkg-price" type="number" min="0" placeholder="99" value={createPrice} onChange={(e) => setCreatePrice(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="pkg-popular" checked={createPopular} onCheckedChange={(c) => setCreatePopular(c === true)} />
              <Label htmlFor="pkg-popular" className="text-sm">Mark as popular</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit">Add package</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) resetEdit(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit package</DialogTitle>
            <DialogDescription>Update this credit package.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Package name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-credits">Credits</Label>
              <Input id="edit-credits" type="number" min="0" value={editCredits} onChange={(e) => setEditCredits(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (USD)</Label>
              <Input id="edit-price" type="number" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="edit-popular" checked={editPopular} onCheckedChange={(c) => setEditPopular(c === true)} />
              <Label htmlFor="edit-popular" className="text-sm">Mark as popular</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/admin/packages")({
  component: PackagesPage,
});
