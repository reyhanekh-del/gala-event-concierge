import { Home, Calendar, Send, Bell, Settings } from "lucide-react";
import type { MobileTab } from "@/components/gala/MobileShell";

export const organizerTabs: MobileTab[] = [
  { to: "/organizer/dashboard", label: "Home", icon: Home },
  { to: "/organizer/events", label: "Events", icon: Calendar },
  { to: "/organizer/invite", label: "Invite", icon: Send },
  { to: "/organizer/notifications", label: "Alerts", icon: Bell },
  { to: "/organizer/settings", label: "More", icon: Settings },
];
