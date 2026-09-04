import { LoginForm } from '@/components/login-form';
import { LoginBrandPanel } from '@/components/page/login/login-brand-panel';

export default function LoginPage() {
  return (
    <div className='relative min-h-[calc(100dvh-58px)] md:min-h-[calc(100dvh-78px)] overflow-hidden bg-boom-surface'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#dbeafe_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,#eff6ff_0%,transparent_55%)]'
      />

      <div className='container relative flex min-h-[inherit] items-center py-10 md:py-16'>
        <div className='grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16'>
          <LoginBrandPanel />
          <div className='flex justify-center lg:justify-end'>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
