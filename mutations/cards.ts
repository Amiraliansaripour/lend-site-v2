// * @tanstack/react-query
import { useMutation } from '@tanstack/react-query';

// * api
import { createCard, deleteCard, updateCard } from '@/api/cards';

// * queries
import { queryKeys } from '@/queries/cards';

// * types
import type { CreateCardPayload, UpdateCardPayload } from '@/types/cards';

export const mutationKeys = {
  cards: {
    crud: ['cards'],
    create: () => [...mutationKeys.cards.crud, 'cards.create'],
    update: () => [...mutationKeys.cards.crud, 'cards.update'],
    delete: () => [...mutationKeys.cards.crud, 'cards.delete'],
  },
} as const;

export const useCreateCard = () => {
  return useMutation({
    mutationKey: mutationKeys.cards.create(),
    mutationFn: (payload: CreateCardPayload) => createCard(payload),
    meta: { invalidatesQueries: [queryKeys.cards] },
  });
};

export const useUpdateCard = () => {
  return useMutation({
    mutationKey: mutationKeys.cards.update(),
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCardPayload }) =>
      updateCard(id, payload),
    meta: { invalidatesQueries: [queryKeys.cards] },
  });
};

export const useDeleteCard = () => {
  return useMutation({
    mutationKey: mutationKeys.cards.delete(),
    mutationFn: (id: string) => deleteCard(id),
    meta: { invalidatesQueries: [queryKeys.cards] },
  });
};
