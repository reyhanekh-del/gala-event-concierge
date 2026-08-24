import { Home, Calendar, Send, ListChecks, Settings } from "lucide-react";
import type { MobileTab } from "@/components/gala/MobileShell";

export const organizerTabs: MobileTab[] = [
  { to: "/organizer/dashboard", label: "Home", icon: Home },
  { to: "/organizer/events", label: "Events", icon: Calendar },
  { to: "/organizer/guests", label: "Guests", icon: ListChecks },
  { to: "/organizer/invite", label: "Invites", icon: Send },
  { to: "/organizer/settings", label: "More", icon: Settings },
];
