import AppLayout from '@/components/layouts/AppLayout'
import TransactionsClient from '@/components/TransactionsClient'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <TransactionsClient />
      </AppLayout>
    </ProtectedRoute>
  )
}
