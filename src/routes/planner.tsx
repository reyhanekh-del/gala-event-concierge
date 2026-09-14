import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Calendar, MapPin, CreditCard, BarChart3 } from "lucide-react";
import { PortalShell } from "@/components/gala/PortalShell";

export const Route = createFileRoute("/planner")({
  component: () => (
    <PortalShell
      logoTo="/planner"
      title="Event Planner"
      nav={[
        { to: "/planner", label: "Dashboard", icon: Home },
        { to: "/planner/events", label: "Events", icon: Calendar },
        { to: "/planner/locations", label: "Locations", icon: MapPin },
        { to: "/planner/credits", label: "Credits", icon: CreditCard },
        { to: "/planner/analytics", label: "Analytics", icon: BarChart3 },
      ]}
    >
      <Outlet />
    </PortalShell>
  ),
});
