export function InstallmentCardSkeleton() {
  return (
    <div className='mt-8 animate-pulse'>
      <div className='h-32 rounded-t-xl bg-primary/10 p-6' />
      <div className='rounded-b-xl border border-t-0 border-border bg-card p-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='h-32 rounded-xl bg-muted p-5' />
          ))}
        </div>
      </div>
    </div>
  );
}

export function InstallmentsListSkeleton() {
  return (
    <div className='space-y-4'>
      {[1, 2, 3].map(i => (
        <InstallmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
