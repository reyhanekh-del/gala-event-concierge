import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/planner/locations")({
  component: () => <Outlet />,
});
