'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardBottomNav } from '@/components/dashboard-bottom-nav';
import { DashboardHeader } from '@/components/dashboard-header';
import { DirectionProvider } from '@radix-ui/react-direction';

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DirectionProvider dir='rtl'>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className='min-w-0'>
          <DashboardHeader />

          <main className='min-w-0 overflow-x-hidden pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0'>
            {children}
          </main>
          <DashboardBottomNav />
        </SidebarInset>
      </SidebarProvider>
    </DirectionProvider>
  );
}
