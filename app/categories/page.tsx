import CategoriesClient from '@/components/CategoriesClient';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import AppLayout from '@/components/layouts/AppLayout';

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <CategoriesClient />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
