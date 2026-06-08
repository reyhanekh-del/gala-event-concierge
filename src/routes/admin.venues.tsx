import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeader } from "@/components/gala/Primitives";
import { venues as seedVenues, type Venue } from "@/mock/data";
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
import { toast } from "sonner";

function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>(seedVenues);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [credits, setCredits] = useState("");

  const reset = () => {
    setName("");
    setCity("");
    setCredits("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      toast.error("Name and city are required");
      return;
    }
    const newVenue: Venue = {
      id: `v_${Date.now()}`,
      name: name.trim(),
      city: city.trim(),
      creditsPurchased: Number(credits) || 0,
      creditsAllocated: 0,
      revenue: 0,
    };
    setVenues((v) => [newVenue, ...v]);
    toast.success(`${newVenue.name} added`);
    reset();
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <SectionHeader title="Venues" subtitle={`${venues.length} on the platform`} />
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus /> Create venue
        </Button>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {venues.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between px-6 py-4 border-b last:border-0"
          >
            <div>
              <p className="font-medium">{v.name}</p>
              <p className="text-xs text-muted-foreground">{v.city}</p>
            </div>
            <div className="flex gap-8 text-sm">
              <div className="text-end">
                <p className="text-xs text-muted-foreground">Credits</p>
                <p className="font-medium">{v.creditsPurchased.toLocaleString()}</p>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="font-medium">${(v.revenue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create venue</DialogTitle>
            <DialogDescription>Add a new hotel or venue to the platform.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue-name">Venue name</Label>
              <Input
                id="venue-name"
                placeholder="The Ritz-Carlton Riyadh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-city">City</Label>
              <Input
                id="venue-city"
                placeholder="Riyadh"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-credits">Initial credits</Label>
              <Input
                id="venue-credits"
                type="number"
                min="0"
                placeholder="0"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create venue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/admin/venues")({
  component: VenuesPage,
});
