import AppLayout from '@/components/layouts/AppLayout'
import SettingsClient from '@/components/SettingsClient'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <SettingsClient />
      </AppLayout>
    </ProtectedRoute>
  )
}
