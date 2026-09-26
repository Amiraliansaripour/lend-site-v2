// * api
import { api } from '@/lib/api/client';

// * types
import type { APIResult } from '@/types/api';
import type { BankCard, CreateCardPayload, UpdateCardPayload } from '@/types/cards';

const CARD_API_OPTIONS = { suppressErrorToast: true } as const;

export const getUserCards = async () => {
  const resp = await api.get<APIResult<BankCard[]>>('/Card/GetUserCards', CARD_API_OPTIONS);

  return resp.data.data || [];
};

export const getCardById = async (id: string) => {
  const resp = await api.get<APIResult<BankCard>>(`/Card/GetCardById/${id}`, CARD_API_OPTIONS);

  return resp.data.data;
};

export const createCard = async (payload: CreateCardPayload) => {
  const resp = await api.post<CreateCardPayload, APIResult<BankCard>>(
    '/Card/CreateCard',
    payload,
    CARD_API_OPTIONS,
  );

  return resp.data;
};

export const updateCard = async (id: string, payload: UpdateCardPayload) => {
  const resp = await api.put<UpdateCardPayload, APIResult<BankCard>>(
    `/Card/UpdateCard/${id}`,
    payload,
    CARD_API_OPTIONS,
  );

  return resp.data;
};

export const deleteCard = async (id: string) => {
  const resp = await api.delete<never, APIResult<unknown>>(
    `/Card/DeleteCard/${id}`,
    undefined as never,
    CARD_API_OPTIONS,
  );

  return resp.data;
};
