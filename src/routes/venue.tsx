import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { Home, Calendar, CreditCard, BarChart3, DollarSign, Settings } from "lucide-react";
import { PortalShell } from "@/components/gala/PortalShell";

export const Route = createFileRoute("/venue")({
  component: () => (
    <PortalShell
      logoTo="/venue"
      title="Venue Portal"
      nav={[
        { to: "/venue", label: "Dashboard", icon: Home },
        { to: "/venue/events", label: "Events", icon: Calendar },
        { to: "/venue/credits", label: "Credits", icon: CreditCard },
        { to: "/venue/analytics", label: "Analytics", icon: BarChart3 },
        { to: "/venue/revenue", label: "Revenue", icon: DollarSign },
      ]}
    >
      <Outlet />
    </PortalShell>
  ),
});
