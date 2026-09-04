import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function AppLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <div className='grid grid-rows-[auto_1fr_auto] min-h-dvh relative'>
      <Header />
      <main className='-mt-[70px] lg:-mt-[88px]'>{children}</main>
      <Footer />
    </div>
  );
}
