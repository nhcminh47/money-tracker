import SettingsClient from '@/components/SettingsClient';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import AppLayout from '@/components/layouts/AppLayout';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 pl-14 text-gray-900 dark:text-gray-100">Settings</h2>
            <SettingsClient />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
