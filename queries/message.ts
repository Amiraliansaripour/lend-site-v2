import { useQuery } from '@tanstack/react-query';

import {
  getAllAdmins,
  getConversationMessages,
  getConversations,
  getUnreadMessageCount,
} from '@/api/message';

export const messageKeys = {
  all: ['messages'] as const,
  conversations: () => [...messageKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...messageKeys.all, 'conversation', id] as const,
  admins: () => [...messageKeys.all, 'admins'] as const,
  unreadCount: () => [...messageKeys.all, 'unread-count'] as const,
};

export const useConversations = () => {
  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: getConversations,
  });
};

export const useConversationMessages = (conversationId?: string | null) => {
  return useQuery({
    queryKey: messageKeys.conversation(conversationId || ''),
    queryFn: () => getConversationMessages(conversationId!),
    enabled: Boolean(conversationId),
  });
};

export const useAdmins = (enabled = true) => {
  return useQuery({
    queryKey: messageKeys.admins(),
    queryFn: getAllAdmins,
    enabled,
  });
};

export const useUnreadMessageCount = () => {
  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: getUnreadMessageCount,
    refetchInterval: 60_000,
  });
};
