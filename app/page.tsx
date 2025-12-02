import DashboardClient from '@/components/DashboardClient';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import AppLayout from '@/components/layouts/AppLayout';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <DashboardClient />
      </AppLayout>
    </ProtectedRoute>
  );
}
