import { Mouse } from 'lucide-react';

export function ScrollIcon() {
  return (
    <div className='absolute bottom-8 inset-x-1/2 -translate-x-1/2 flex flex-col items-center text-white mt-32'>
      <Mouse className='size-8 mb-2' />
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        strokeWidth='2'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='lucide lucide-chevrons-down-icon lucide-chevrons-down animate-bounce'
      >
        <path d='m7 6 5 5 5-5' />
        <path d='m7 13 5 5 5-5' />
      </svg>
    </div>
  );
}
