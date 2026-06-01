import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/gala/PhoneFrame";

export const Route = createFileRoute("/organizer")({
  component: () => (
    <PhoneFrame>
      <Outlet />
    </PhoneFrame>
  ),
});
