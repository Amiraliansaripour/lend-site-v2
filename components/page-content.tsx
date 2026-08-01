type PageContent = {
  title: string;
  children: React.ReactNode;
};

export const PageContent = ({ children, title }: PageContent) => {
  return (
    <div className='bg-sidebar min-w-0 rounded-lg border p-4'>
      <div className='mb-6 flex items-center gap-x-1.5'>
        <div className='h-5 w-1 bg-primary' />
        <span className='text-lg font-medium'>{title}</span>
      </div>

      {children}
    </div>
  );
};
