'use client';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { DirectionProvider } from '@radix-ui/react-direction';

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DirectionProvider dir='rtl'>
      <SidebarProvider className='dashboard-shell'>
        <AppSidebar />

        <SidebarInset className='min-w-0'>
          <header className='sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-3 backdrop-blur-md md:px-4'>
            <SidebarTrigger className='-ms-1' />
            <ThemeToggle compact />
          </header>
          <main className='min-w-0 overflow-x-hidden'>{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DirectionProvider>
  );
}
