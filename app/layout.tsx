import { InstallPrompt } from '@/components/InstallPrompt'
import { NetworkStatus } from '@/components/NetworkStatus'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { StorageManager } from '@/components/StorageManager'
import { SyncManager } from '@/components/SyncManager'
import { SyncStatus } from '@/components/SyncStatus'
import { ThemeProvider } from '@/components/ThemeProvider'
import { UpdateNotification } from '@/components/UpdateNotification'
import { AuthProvider } from '@/lib/auth/AuthContext'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Money Tracker',
  description: 'Personal finance tracker - offline-first PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Money Tracker',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <link
          rel='icon'
          href='/icons/icon.svg'
          type='image/svg+xml'
        />
        <link
          rel='apple-touch-icon'
          href='/icons/icon.svg'
        />
        <meta
          name='mobile-web-app-capable'
          content='yes'
        />
        <meta
          name='apple-mobile-web-app-capable'
          content='yes'
        />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
      </head>
      <body className={`${inter.variable} antialiased font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <SyncManager />
            <StorageManager />
            <OfflineIndicator />
            <NetworkStatus />
            <SyncStatus />
            <InstallPrompt />
            <UpdateNotification />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
