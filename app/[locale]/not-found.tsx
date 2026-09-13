import { SentryNotFoundReporter } from '@/components/sentry-not-found-reporter';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8'>
      <SentryNotFoundReporter />
      <h1 className='text-2xl font-semibold'>404</h1>
      <p className='text-muted-foreground'>Page not found</p>
      <Button asChild>
        <Link href='/'>Home</Link>
      </Button>
    </div>
  );
}
