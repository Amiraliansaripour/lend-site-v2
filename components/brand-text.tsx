'use client';

import { useSiteTemplate } from '@/providers/site-template';

type BrandTextProps = {
  children: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'div';
  className?: string;
};

export function BrandText({ children, as: Tag = 'span', className }: BrandTextProps) {
  const { withBrand } = useSiteTemplate();
  return <Tag className={className}>{withBrand(children)}</Tag>;
}

export function BrandName({ className }: { className?: string }) {
  const { brandName } = useSiteTemplate();
  return <span className={className}>{brandName}</span>;
}
