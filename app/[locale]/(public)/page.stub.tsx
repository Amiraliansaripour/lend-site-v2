/**
 * Disabled: this file was replaced by the landing page at `(public)/(app)/page.tsx`.
 *
 * Both routes resolved to `/{locale}/`, so this locale-picker stub was winning
 * over the real homepage. Renamed from `page.tsx` → `page.stub.tsx` so Next.js
 * no longer registers it as a route.
 *
 * import { Link } from '@/i18n/navigation';
 * import { asyncT } from '@/i18n/translation';
 *
 * import { Button } from '@/components/ui/button';
 *
 * export default async function IndexPage() {
 *   const t = await asyncT('Index');
 *
 *   return (
 *     <main className='flex flex-col items-center justify-center gap-4 w-dvw h-dvh'>
 *       <p>{t('brand')}</p>
 *
 *       <footer className='flex items-center gap-x-2'>
 *         <Button asChild>
 *           <Link href='/' locale='en'>
 *             en
 *           </Link>
 *         </Button>
 *         <Button asChild>
 *           <Link href='/' locale='fa'>
 *             fa
 *           </Link>
 *         </Button>
 *       </footer>
 *     </main>
 *   );
 * }
 */

export {};
