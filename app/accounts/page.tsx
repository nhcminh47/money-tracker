import AccountsClient from '@/components/AccountsClient';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import AppLayout from '@/components/layouts/AppLayout';

export default function AccountsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <AccountsClient />
      </AppLayout>
    </ProtectedRoute>
  );
}
