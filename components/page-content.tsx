type PageContent = {
  title: string;
  children: React.ReactNode;
};

export const PageContent = ({ children, title }: PageContent) => {
  return (
    <div className='min-w-0 rounded-lg border border-border bg-card p-4 shadow-[0_1px_0_0] shadow-primary/5'>
      <div className='mb-6 flex items-center gap-x-1.5'>
        <div className='h-5 w-1 rounded-full bg-primary' />
        <span className='text-lg font-medium text-foreground'>{title}</span>
      </div>

      {children}
    </div>
  );
};
