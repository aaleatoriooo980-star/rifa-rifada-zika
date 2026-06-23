import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";

export const Route = createFileRoute("/admin")({
  component: () => (
    <ProtectedRoute role="admin">
      <AdminLayout />
    </ProtectedRoute>
  ),
});
