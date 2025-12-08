import CategoriesClient from '@/components/CategoriesClient'
import AppLayout from '@/components/layouts/AppLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <CategoriesClient />
      </AppLayout>
    </ProtectedRoute>
  )
}
