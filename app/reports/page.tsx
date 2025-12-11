import AppLayout from '@/components/layouts/AppLayout'
import ReportsClient from '@/components/ReportsClient'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'

export const metadata = {
  title: 'Reports | Money Tracker',
  description: 'Comprehensive financial analysis and insights',
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ReportsClient />
      </AppLayout>
    </ProtectedRoute>
  )
}
