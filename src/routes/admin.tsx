import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Building2, Users, Package, Bell, DollarSign, ScrollText, LifeBuoy } from "lucide-react";
import { PortalShell } from "@/components/gala/PortalShell";

export const Route = createFileRoute("/admin")({
  component: () => (
    <PortalShell
      logoTo="/admin"
      title="Gala Admin"
      nav={[
        { to: "/admin", label: "Dashboard", icon: Home },
        { to: "/admin/venues", label: "Venues", icon: Building2 },
        { to: "/admin/organizers", label: "Organizers", icon: Users },
        { to: "/admin/packages", label: "Packages", icon: Package },
        { to: "/admin/notifications", label: "Notifications", icon: Bell },
        { to: "/admin/revenue", label: "Revenue", icon: DollarSign },
        { to: "/admin/audit", label: "Audit logs", icon: ScrollText },
        { to: "/admin/support", label: "Support", icon: LifeBuoy },
      ]}
    >
      <Outlet />
    </PortalShell>
  ),
});
