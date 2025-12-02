'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex bg-notion-bg dark:bg-notion-bg-dark">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
