type PageContent = {
  title: string;
  children: React.ReactNode;
};

export const PageContent = ({ children, title }: PageContent) => {
  return (
    <div className='bg-sidebar rounded-lg p-4 border'>
      <div className='flex items-center gap-x-1.5 mb-6'>
        <div className='w-1 h-5 bg-primary' />
        <span className='text-lg font-medium'>{title}</span>
      </div>

      {children}
    </div>
  );
};
