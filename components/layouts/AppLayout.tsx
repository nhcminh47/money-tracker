'use client'

import { ReactNode } from 'react'
import BackToTop from '../BackToTop'
import { InstallPrompt } from '../InstallPrompt'
import MobileBottomNav from './MobileBottomNav'
import Sidebar from './Sidebar'
import { SidebarProvider } from './SidebarContext'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className='min-h-screen md:p-6 bg-gradient-to-br from-coral-300 via-coral-200 to-coral-100 overflow-x-hidden'>
        <div className='h-screen md:h-[calc(100vh-3rem)] flex bg-white md:rounded-[32px] md:shadow-2xl overflow-hidden w-full max-w-full'>
          <Sidebar />

          <main className='flex-1 overflow-y-auto overflow-x-hidden bg-white scrollbar-hide pb-24 md:pb-0 w-full'>
            <div className='container mx-auto max-w-[1400px] p-4 md:p-8 w-full'>{children}</div>
          </main>
        </div>

        <MobileBottomNav />
        <BackToTop />
        <InstallPrompt />
      </div>
    </SidebarProvider>
  )
}
