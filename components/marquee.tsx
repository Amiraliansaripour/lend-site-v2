type MarqueeProps = { children: React.ReactNode };

export function Marquee({ children }: MarqueeProps) {
  return (
    <div className='grid -mx-4 sm:mx-0'>
      <div className='overflow-hidden'>
        <section className='marquee flex items-center gap-x-12 w-fit'>
          <div className='flex items-center justify-between gap-x-12 w-full *:shrink-0'>
            {children}
          </div>
          <div className='flex items-center justify-between gap-x-12 w-fit *:shrink-0'>
            {children}
          </div>
          <div className='flex items-center justify-between gap-x-12 w-fit *:shrink-0'>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
