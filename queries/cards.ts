// * @tanstack/react-query
import { useQuery } from '@tanstack/react-query';

// * api
import { getCardById, getUserCards } from '@/api/cards';

export const queryKeys = {
  cards: ['cards'] as const,
  userCards: () => [...queryKeys.cards, 'user'] as const,
  card: (id: string) => [...queryKeys.cards, 'detail', id] as const,
} as const;

export const useUserCards = () => {
  return useQuery({
    queryKey: queryKeys.userCards(),
    queryFn: getUserCards,
  });
};

export const useCard = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.card(id || ''),
    queryFn: () => getCardById(id!),
    enabled: Boolean(id),
  });
};
