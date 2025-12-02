import TransactionsClient from '@/components/TransactionsClient';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import AppLayout from '@/components/layouts/AppLayout';

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <TransactionsClient />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

