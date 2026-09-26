import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';

export type FaqAnswer = {
  id: string;
  answerText: string;
  isPrimary: boolean;
  likeCount?: number;
  dislikeCount?: number;
  createdDateTime?: string;
};

export type FaqItem = {
  id: string;
  category: string;
  question: string;
  order: number;
  isActive: boolean;
  viewCount?: number;
  createdDateTime?: string;
  answers: FaqAnswer[];
};

export async function getFaqs() {
  const { data, resp } = await api.get<APIResult<FaqItem[]>>('/FAQ/GetAll', {
    skipAuth: true,
    suppressErrorToast: true,
  });

  if (!resp.ok) {
    throw new Error(data?.message || 'خطا در دریافت سوالات متداول');
  }

  const payload = data?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(payload) ? payload : [];
}
