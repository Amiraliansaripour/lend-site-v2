import { api } from '@/lib/api/client';
import type { APIResult } from '@/types/api';

/** Message delivery status from API */
export enum MessageStatus {
  Sent = 1,
  Seen = 3,
  Replied = 4,
}

/**
 * Participant / sender role used to distinguish inbox threads.
 * System notifications use PayamSystem and are read-only (no reply).
 */
export enum MessageParticipantRole {
  PayamSystem = 7,
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
  receiverRole?: number;
  subject: string;
  body: string;
  status: MessageStatus | number;
  sentAt: string;
  readAt?: string | null;
  isDeleted: boolean;
  senderRole?: number | null;
  role?: number | null;
  parentMessageId?: string | null;
  attachmentId?: string | null;
  attachmentUrl?: string | null;
  dateNow?: string;
};

export type Conversation = {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherRole?: number;
  lastMessage: Message | null;
  lastMessageAt: string;
  unreadCount: number;
  /** Other participant role when provided by API (e.g. PayamSystem = 7) */
  otherUserRole?: number | null;
  role?: number | null;
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

export const isPayamSystemRole = (role?: number | null): boolean =>
  Number(role) === MessageParticipantRole.PayamSystem;

/** System notification threads: tag + read-only (no chat/reply). */
export const isSystemConversation = (conversation: Conversation | null | undefined): boolean => {
  if (!conversation) return false;
  if (
    isPayamSystemRole(conversation.otherUserRole) ||
    isPayamSystemRole(conversation.otherRole) ||
    isPayamSystemRole(conversation.role)
  ) {
    return true;
  }
  const last = conversation.lastMessage;
  if (last && (isPayamSystemRole(last.senderRole) || isPayamSystemRole(last.role))) {
    return true;
  }
  return false;
};

export const isSystemMessage = (message: Message | null | undefined): boolean => {
  if (!message) return false;
  return isPayamSystemRole(message.senderRole) || isPayamSystemRole(message.role);
};

/** Conversation or any message in the open thread is system → read-only UI. */
export const isSystemThread = (
  conversation: Conversation | null | undefined,
  messages?: Message[] | null,
): boolean => {
  if (isSystemConversation(conversation)) return true;
  return Boolean(messages?.some(isSystemMessage));
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
