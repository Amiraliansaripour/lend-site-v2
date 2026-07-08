<<<<<<< HEAD
export function InstallmentCardSkeleton() {
  return (
    <div className='mt-8 animate-pulse'>
      <div className='bg-gray-300 p-6 rounded-t-xl h-32' />
      <div className='bg-white p-6 rounded-b-xl border-t border-gray-100'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[1, 2, 3].map(i => (
            <div key={i} className='bg-gray-100 p-5 rounded-xl h-32' />
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
=======
export function InstallmentCardSkeleton() {
  return (
    <div className='mt-8 animate-pulse'>
      <div className='bg-gray-300 p-6 rounded-t-xl h-32' />
      <div className='bg-white p-6 rounded-b-xl border-t border-gray-100'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[1, 2, 3].map(i => (
            <div key={i} className='bg-gray-100 p-5 rounded-xl h-32' />
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
>>>>>>> a47b58a (pwa)
