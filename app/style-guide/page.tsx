import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import AppLayout from '@/components/layouts/AppLayout';
import StyleGuideClient from '@/components/StyleGuideClient';

export default function StyleGuidePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <StyleGuideClient />
      </AppLayout>
    </ProtectedRoute>
  );
}
