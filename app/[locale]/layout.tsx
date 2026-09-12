import type { Metadata, Viewport } from 'next';

import { NextIntlClientProvider } from 'next-intl';
import { dirFor } from '@/i18n/routing';

import { NuqsProvider } from '@/providers/nuqs';
import { AuthListener } from '@/lib/auth/auth-listener';
import { QueryClientProvider } from '@/lib/query-client/provider';
import { SiteTemplateProvider } from '@/providers/site-template';

import '@/lib/env';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';

export const metadata: Metadata = {
  title: 'Lend Site',
  description: 'Lend financial services platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lend Site',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export default async function RootLayout({ params, children }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;

  return (
    <html lang={locale} dir={dirFor(locale)}>
      <body className='antialiased'>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaDeferredPrompt=e;});})();`,
          }}
        />
        <Toaster toastOptions={{ className: 'IranYekan !important' }} />

        <NextIntlClientProvider>
          <NuqsProvider>
            <AuthListener />
            <PwaInstallPrompt />
            <QueryClientProvider>
              <SiteTemplateProvider>{children}</SiteTemplateProvider>
            </QueryClientProvider>
          </NuqsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
