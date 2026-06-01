import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/organizer/")({
  component: () => <Navigate to="/organizer/splash" />,
});
