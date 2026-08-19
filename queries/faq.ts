import { useQuery } from '@tanstack/react-query';
import { getFaqs } from '@/api/faq';

export const faqQueryKeys = {
  all: ['faq'] as const,
  list: () => [...faqQueryKeys.all, 'list'] as const,
};

export const useFaqs = () => {
  return useQuery({
    queryKey: faqQueryKeys.list(),
    queryFn: getFaqs,
    staleTime: 5 * 60 * 1000,
  });
};
