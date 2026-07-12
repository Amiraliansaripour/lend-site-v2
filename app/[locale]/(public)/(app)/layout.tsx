import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function AppLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <div className='grid grid-rows-[1fr_auto] min-h-dvh'>
      <Header />
      <main className=''>{children}</main>
      <Footer />
    </div>
  );
}
