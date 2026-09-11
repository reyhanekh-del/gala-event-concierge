import { CalendarDays, ListChecks, WalletCards, Settings } from "lucide-react";
import type { MobileTab } from "@/components/gala/MobileShell";

export const organizerTabs: MobileTab[] = [
  { to: "/organizer/dashboard", label: "Events", icon: CalendarDays },
  { to: "/organizer/guests", label: "Guests", icon: ListChecks },
  { to: "/organizer/credits/ledger", label: "Credits", icon: WalletCards },
  { to: "/organizer/settings", label: "Settings", icon: Settings },
];
