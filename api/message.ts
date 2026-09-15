import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';

/** Message delivery status from API */
export enum MessageStatus {
  Sent = 1,
  Read = 3,
  Answered = 4,
}

/** Attachment type used when uploading message files */
export const MESSAGE_ATTACHMENT_TYPE = 422;

export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: number;
  username: string;
};

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  body: string;
  status: MessageStatus | number;
  sentAt: string;
  readAt: string | null;
  isDeleted: boolean;
  parentMessageId: string | null;
  attachmentId: string | null;
  attachmentUrl: string | null;
};

export type Conversation = {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: Message | null;
  lastMessageAt: string;
  unreadCount: number;
};

export type SendMessagePayload = {
  receiverId: string;
  subject: string;
  body: string;
  attachmentId?: string | null;
};

export type ReplyMessagePayload = {
  parentMessageId: string;
  body: string;
  attachmentId?: string | null;
};

export type UnreadCount = {
  count: number;
};

export const getAllAdmins = async (): Promise<AdminUser[]> => {
  const { data } = await api.get<APIResult<AdminUser[]>>('/User/GetAllAdminId');

  if (data?.isSuccess && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

export const sendMessage = async (payload: SendMessagePayload) => {
  const { data } = await api.post<SendMessagePayload, APIResult<Message>>('/Message/send', payload);
  return data;
};

export const replyMessage = async (payload: ReplyMessagePayload) => {
  const { data } = await api.post<ReplyMessagePayload, APIResult<Message>>(
    '/Message/reply',
    payload,
  );
  return data;
};

export const getMyMessages = async (): Promise<Message[]> => {
  const { data } = await api.get<APIResult<Message[]>>('/Message/my-messages');

  if (data?.isSuccess && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

export const getConversations = async (): Promise<Conversation[]> => {
  const { data } = await api.get<APIResult<Conversation[]>>('/Message/conversations');

  if (data?.isSuccess && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const { data } = await api.get<APIResult<Message[]>>(`/Message/conversation/${conversationId}`);

  if (data?.isSuccess && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

export const markMessageAsRead = async (messageId: string) => {
  const { data } = await api.post<Record<string, never>, APIResult<unknown>>(
    `/Message/${messageId}/read`,
    {},
  );
  return data;
};

export const deleteMessage = async (messageId: string) => {
  const { data } = await api.delete<Record<string, never>, APIResult<unknown>>(
    `/Message/${messageId}`,
    {},
  );
  return data;
};

export const getUnreadMessageCount = async (): Promise<number> => {
  const { data } = await api.get<APIResult<UnreadCount>>('/Message/unread-count');

  if (data?.isSuccess && data.data) {
    return data.data.count ?? 0;
  }

  return 0;
};
