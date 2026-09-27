import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function AppLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <div className='grid min-h-dvh grid-rows-[1fr_auto]'>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
