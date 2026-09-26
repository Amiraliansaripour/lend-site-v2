import { useMutation } from '@tanstack/react-query';

import {
  deleteMessage,
  markMessageAsRead,
  replyMessage,
  sendMessage,
  type ReplyMessagePayload,
  type SendMessagePayload,
} from '@/api/message';
import { messageKeys } from '@/queries/message';

export const mutationKeys = {
  messages: {
    crud: ['messages'] as const,
    send: () => [...mutationKeys.messages.crud, 'send'] as const,
    reply: () => [...mutationKeys.messages.crud, 'reply'] as const,
    read: () => [...mutationKeys.messages.crud, 'read'] as const,
    delete: () => [...mutationKeys.messages.crud, 'delete'] as const,
  },
} as const;

export const useSendMessage = () => {
  return useMutation({
    mutationKey: mutationKeys.messages.send(),
    mutationFn: (payload: SendMessagePayload) => sendMessage(payload),
    meta: {
      invalidatesQueries: [messageKeys.conversations(), messageKeys.unreadCount(), messageKeys.all],
    },
  });
};

export const useReplyMessage = () => {
  return useMutation({
    mutationKey: mutationKeys.messages.reply(),
    mutationFn: (payload: ReplyMessagePayload) => replyMessage(payload),
    meta: {
      invalidatesQueries: [messageKeys.conversations(), messageKeys.unreadCount(), messageKeys.all],
    },
  });
};

export const useMarkMessageAsRead = () => {
  return useMutation({
    mutationKey: mutationKeys.messages.read(),
    mutationFn: (messageId: string) => markMessageAsRead(messageId),
    meta: {
      invalidatesQueries: [messageKeys.conversations(), messageKeys.unreadCount()],
    },
  });
};

export const useDeleteMessage = () => {
  return useMutation({
    mutationKey: mutationKeys.messages.delete(),
    mutationFn: (messageId: string) => deleteMessage(messageId),
    meta: {
      invalidatesQueries: [messageKeys.conversations(), messageKeys.unreadCount(), messageKeys.all],
    },
  });
};
