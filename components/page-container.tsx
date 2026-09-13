import { Fragment } from 'react';

import { Separator } from './ui/separator';
import { SidebarTrigger } from './ui/sidebar';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

export type Breadcrumbs = { label: string; href?: string }[];

type PageContainerProps = {
  breadcrumbs?: Breadcrumbs;
  children: React.ReactNode;
};

export const PageContainer = ({ children, breadcrumbs = [] }: PageContainerProps) => {
  return (
    <>
      <header className='flex h-16 shrink-0 items-center gap-2'>
        <div className='flex items-center gap-2 px-4'>
          <SidebarTrigger className='-ml-1 hidden md:inline-flex' />
          {breadcrumbs.length > 0 && (
            <>
              <Separator
                orientation='vertical'
                className='mr-2 hidden data-[orientation=vertical]:h-4 md:block'
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map(({ label }, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                      <Fragment key={label}>
                        <BreadcrumbItem className={isLast ? undefined : 'hidden md:block'}>
                          <BreadcrumbPage>{label}</BreadcrumbPage>
                        </BreadcrumbItem>

                        {!isLast && (
                          <BreadcrumbSeparator className='hidden md:block rtl:-scale-x-100' />
                        )}
                      </Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </>
          )}
        </div>
      </header>

      <main className='flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0'>{children}</main>
    </>
  );
};
