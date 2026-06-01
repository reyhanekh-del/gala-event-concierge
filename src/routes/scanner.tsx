import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/scanner")({
  component: () => <Outlet />,
});
