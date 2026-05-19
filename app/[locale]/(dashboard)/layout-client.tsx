'use client';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DirectionProvider } from '@radix-ui/react-direction';

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DirectionProvider dir='rtl'>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <main>{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DirectionProvider>
  );
}
