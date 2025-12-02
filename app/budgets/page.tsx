import BudgetsClient from '@/components/BudgetsClient';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import AppLayout from '@/components/layouts/AppLayout';

export default function BudgetsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <BudgetsClient />
      </AppLayout>
    </ProtectedRoute>
  );
}
