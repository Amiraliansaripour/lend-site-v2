'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  Paperclip,
  Plus,
  Reply,
  Search,
  Send,
  UserCog,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { uploadAttachment } from '@/api/facility';
import {
  MESSAGE_ATTACHMENT_TYPE,
  MessageStatus,
  type Conversation,
  type Message,
} from '@/api/message';
import {
  MessageAttachment,
  isMessageImageAttachment,
} from '@/components/page/messages/message-attachment';
import { NewMessageDialog } from '@/components/page/messages/new-message-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getUserId } from '@/lib/auth/client/user-info';
import { cn } from '@/lib/utils';
import { useMarkMessageAsRead, useReplyMessage, useSendMessage } from '@/mutations/message';
import {
  useConversationMessages,
  useConversations,
  useUnreadMessageCount,
} from '@/queries/message';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '؟';
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`;
}

function formatMessageTime(dateString?: string | null): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();

    if (sameDay) {
      return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function lastMessagePreview(message: Message | null | undefined): string {
  if (!message) return '';
  if (message.attachmentUrl) {
    if (isMessageImageAttachment(message.attachmentUrl)) return 'تصویر ارسال شد';
    return 'فایل پیوست';
  }
  return message.body || message.subject || '';
}

function getConversationSubject(messages: Message[], conversation: Conversation | null): string {
  const withSubject = messages.find(m => m.subject?.trim());
  if (withSubject?.subject) return withSubject.subject;
  return conversation?.lastMessage?.subject?.trim() || 'بدون موضوع';
}

/** Incoming message still waiting to be marked seen */
function isUnreadIncoming(message: Message, currentUserId: string): boolean {
  return message.receiverId === currentUserId && Number(message.status) === MessageStatus.Sent;
}

function OutgoingStatusIcon({ status }: { status: number }) {
  // Seen by admin → double ticks
  if (status === MessageStatus.Seen) {
    return <CheckCheck className='size-3.5 text-white/70' aria-label='دیده شده' />;
  }

  // Sent or replied (by me) → single tick
  if (status === MessageStatus.Sent || status === MessageStatus.Replied) {
    return <Check className='size-3.5 text-white/60' aria-label='ارسال شده' />;
  }

  return null;
}

function IncomingStatusIcon({ status }: { status: number }) {
  // Admin message seen/replied → double ticks (user knows admin engagement state)
  if (status === MessageStatus.Seen || status === MessageStatus.Replied) {
    return <CheckCheck className='size-3.5 text-primary/70' aria-label='دیده شده' />;
  }

  return null;
}

export function MessagesPageContent() {
  const currentUserId = getUserId();
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useConversations();
  const { data: unreadTotal = 0 } = useUnreadMessageCount();

  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markedReadRef = useRef<Set<string>>(new Set());

  const {
    data: threadMessages = [],
    isLoading: isLoadingThread,
    refetch: refetchThread,
  } = useConversationMessages(activeId);

  const sendMutation = useSendMessage();
  const replyMutation = useReplyMessage();
  const { mutate: markAsRead } = useMarkMessageAsRead();

  const filtered = useMemo(() => {
    const term = search.trim();
    if (!term) return conversations;
    return conversations.filter(c => c.otherUserName?.includes(term));
  }, [conversations, search]);

  const active: Conversation | null = conversations.find(c => c.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0]!.id);
    }
  }, [conversations, activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  useEffect(() => {
    if (!currentUserId || threadMessages.length === 0) return;

    for (const message of threadMessages) {
      if (!isUnreadIncoming(message, currentUserId)) continue;
      if (markedReadRef.current.has(message.id)) continue;

      markedReadRef.current.add(message.id);
      markAsRead(message.id);
    }
  }, [threadMessages, currentUserId, markAsRead]);

  const resetComposer = useCallback(() => {
    setDraft('');
    setAttachedFile(null);
    setReplyTo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, []);

  const selectConversation = (id: string) => {
    setActiveId(id);
    setMobileShowChat(true);
    resetComposer();
  };

  const startReply = useCallback((message: Message) => {
    setReplyTo(message);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const uploadOptionalAttachment = async (file: File | null) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('Name', file.name);
    formData.append('attachmentType', String(MESSAGE_ATTACHMENT_TYPE));
    formData.append('file', file);
    const uploaded = await uploadAttachment(formData);
    return uploaded.id;
  };

  const handleSubmitMessage = useCallback(async () => {
    if (!active || (!draft.trim() && !attachedFile)) return;

    const body = draft.trim() || (attachedFile ? attachedFile.name : '');

    try {
      setIsSending(true);
      const attachmentId = await uploadOptionalAttachment(attachedFile);

      // Explicit reply to a message → /Message/reply
      if (replyTo) {
        const result = await replyMutation.mutateAsync({
          parentMessageId: replyTo.id,
          body,
          attachmentId,
        });

        if (result?.isSuccess === false) {
          toast.error(result.message || 'ارسال پاسخ ناموفق بود');
          return;
        }
      } else {
        // All other user messages → /Message/send
        if (!active.otherUserId) {
          toast.error('گیرنده پیام مشخص نیست');
          return;
        }

        const result = await sendMutation.mutateAsync({
          receiverId: active.otherUserId,
          subject: getConversationSubject(threadMessages, active),
          body,
          attachmentId,
        });

        if (result?.isSuccess === false) {
          toast.error(result.message || 'ارسال پیام ناموفق بود');
          return;
        }
      }

      resetComposer();
      await Promise.all([refetchThread(), refetchConversations()]);
    } catch {
      toast.error('خطا در ارسال پیام');
    } finally {
      setIsSending(false);
    }
  }, [
    active,
    draft,
    attachedFile,
    replyTo,
    threadMessages,
    replyMutation,
    sendMutation,
    resetComposer,
    refetchThread,
    refetchConversations,
  ]);

  return (
    <div
      className='flex rounded-2xl border border-border/60 overflow-hidden bg-background shadow-sm'
      style={{ height: 'calc(100vh - 10rem)' }}
    >
      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col border-l border-border/60 bg-muted/20 min-h-0',
          'w-full xl:w-96 xl:min-w-96 shrink-0',
          mobileShowChat && 'hidden xl:flex',
        )}
      >
        <div className='px-4 pt-4 pb-3 space-y-3 shrink-0'>
          <div className='flex items-center justify-between gap-2'>
            <div className='min-w-0'>
              <h2 className='text-base font-bold'>پیام‌ها</h2>
              {unreadTotal > 0 && (
                <span className='text-xs text-muted-foreground'>{unreadTotal} خوانده‌نشده</span>
              )}
            </div>
            <Button
              type='button'
              size='sm'
              className='shrink-0 gap-1.5'
              onClick={() => setComposeOpen(true)}
            >
              <Plus className='size-4' />
              پیام جدید
            </Button>
          </div>

          <div className='relative'>
            <Search className='size-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='جستجو در گفتگوها...'
              className='pr-9 h-9 text-sm bg-background'
            />
          </div>
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto'>
          <div className='px-2 pb-2'>
            {isLoadingConversations && (
              <div className='flex justify-center py-10'>
                <Loader2 className='size-6 animate-spin text-muted-foreground' />
              </div>
            )}

            {!isLoadingConversations && filtered.length === 0 && (
              <p className='text-center text-sm text-muted-foreground py-10'>گفتگویی یافت نشد</p>
            )}

            {filtered.map(conv => {
              const isActive = activeId === conv.id;
              const preview = lastMessagePreview(conv.lastMessage);

              return (
                <button
                  key={conv.id}
                  type='button'
                  onClick={() => selectConversation(conv.id)}
                  className={cn(
                    'w-full text-right rounded-xl px-3 py-3 mb-1 transition-colors',
                    isActive ? 'bg-primary/6' : 'hover:bg-muted/60',
                  )}
                >
                  <div className='flex items-center gap-3'>
                    <div className='relative shrink-0'>
                      <div className='size-11 rounded-full grid place-items-center text-sm font-bold border bg-violet-50 border-violet-200 text-violet-600'>
                        {getInitials(conv.otherUserName || '?')}
                      </div>
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2'>
                        <span
                          className={cn(
                            'font-semibold text-sm truncate',
                            conv.unreadCount > 0 && 'text-foreground',
                          )}
                        >
                          {conv.otherUserName || 'کاربر'}
                        </span>
                        <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                          {formatMessageTime(conv.lastMessageAt || conv.lastMessage?.sentAt)}
                        </span>
                      </div>

                      <div className='flex items-center gap-1.5 mt-0.5'>
                        <Badge
                          variant='outline'
                          className='text-[10px] px-1.5 py-0 h-4.5 border bg-violet-50 border-violet-200 text-violet-600'
                        >
                          <UserCog className='size-2.5 ml-0.5' />
                          ادمین
                        </Badge>
                      </div>

                      <div className='flex items-center justify-between gap-2 mt-1'>
                        <p
                          className={cn(
                            'text-xs truncate',
                            conv.unreadCount > 0
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground',
                          )}
                        >
                          {preview}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className='size-5 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center font-bold shrink-0'>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 min-h-0 bg-background',
          !mobileShowChat && 'hidden xl:flex',
        )}
      >
        {active ? (
          <>
            <div className='flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60 shrink-0'>
              <button
                type='button'
                onClick={() => setMobileShowChat(false)}
                className='xl:hidden text-muted-foreground hover:text-foreground'
                aria-label='بازگشت'
              >
                ←
              </button>

              <div className='flex items-center gap-3 flex-1 min-w-0'>
                <div className='size-10 rounded-full grid place-items-center text-sm font-bold border shrink-0 bg-violet-50 border-violet-200 text-violet-600'>
                  {getInitials(active.otherUserName || '?')}
                </div>
                <div className='min-w-0'>
                  <p className='font-semibold text-sm'>{active.otherUserName || 'کاربر'}</p>
                  {active.lastMessage?.subject && (
                    <p className='text-xs text-muted-foreground truncate'>
                      {active.lastMessage.subject}
                    </p>
                  )}
                </div>
              </div>

              <Badge
                variant='outline'
                className='border shrink-0 bg-violet-50 border-violet-200 text-violet-600'
              >
                ادمین
              </Badge>
            </div>

            <div className='flex-1 min-h-0 overflow-y-auto bg-muted/10'>
              {isLoadingThread ? (
                <div className='flex justify-center py-16'>
                  <Loader2 className='size-6 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <div className='px-5 py-4 space-y-3 max-w-3xl mx-auto'>
                  {threadMessages.length === 0 && (
                    <p className='text-center text-sm text-muted-foreground py-10'>
                      هنوز پیامی در این گفتگو نیست
                    </p>
                  )}

                  {threadMessages.map(msg => {
                    const isMe = currentUserId ? msg.senderId === currentUserId : false;
                    const hasAttachment = Boolean(msg.attachmentUrl || msg.attachmentId);
                    const isReplyingTo = replyTo?.id === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className={cn('group flex', isMe ? 'justify-start' : 'justify-end')}
                      >
                        <div
                          className={cn(
                            'relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 sm:px-4 text-sm leading-relaxed shadow-sm',
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-background border border-border rounded-bl-sm',
                            isReplyingTo && 'ring-2 ring-primary/40',
                          )}
                        >
                          {msg.subject && !msg.parentMessageId && (
                            <p
                              className={cn(
                                'text-xs font-semibold mb-1',
                                isMe ? 'text-white/80' : 'text-muted-foreground',
                              )}
                            >
                              {msg.subject}
                            </p>
                          )}

                          {msg.body && <p className='whitespace-pre-wrap'>{msg.body}</p>}

                          {hasAttachment && (
                            <MessageAttachment attachmentUrl={msg.attachmentUrl} isMe={isMe} />
                          )}

                          <div
                            className={cn(
                              'flex items-center gap-1.5 mt-1.5',
                              isMe ? 'justify-start' : 'justify-end',
                            )}
                          >
                            {!isMe && (
                              <button
                                type='button'
                                onClick={() => startReply(msg)}
                                className={cn(
                                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] transition-colors',
                                  'text-muted-foreground hover:bg-muted hover:text-foreground',
                                  isReplyingTo && 'bg-primary/10 text-primary',
                                )}
                                aria-label='پاسخ'
                              >
                                <Reply className='size-3' />
                                پاسخ
                              </button>
                            )}
                            <span
                              className={cn(
                                'text-[10px]',
                                isMe ? 'text-white/60' : 'text-muted-foreground',
                              )}
                            >
                              {formatMessageTime(msg.sentAt)}
                            </span>
                            {isMe ? (
                              <OutgoingStatusIcon status={Number(msg.status)} />
                            ) : (
                              <IncomingStatusIcon status={Number(msg.status)} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className='border-t border-border/60 bg-background px-4 py-3 shrink-0'>
              {replyTo && (
                <div className='max-w-3xl mx-auto mb-2 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2'>
                  <Reply className='size-3.5 text-primary shrink-0 mt-0.5' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-[11px] font-medium text-primary'>
                      پاسخ به {replyTo.senderName || 'پیام'}
                    </p>
                    <p className='text-xs text-muted-foreground truncate'>
                      {replyTo.body ||
                        (replyTo.attachmentUrl
                          ? isMessageImageAttachment(replyTo.attachmentUrl)
                            ? 'تصویر'
                            : 'فایل پیوست'
                          : '')}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => setReplyTo(null)}
                    className='text-muted-foreground hover:text-foreground shrink-0'
                    aria-label='لغو پاسخ'
                  >
                    <X className='size-3.5' />
                  </button>
                </div>
              )}

              {attachedFile && (
                <div className='max-w-3xl mx-auto mb-2 flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs'>
                  <Paperclip className='size-3.5 text-muted-foreground shrink-0' />
                  <span className='truncate flex-1'>{attachedFile.name}</span>
                  <button
                    type='button'
                    onClick={() => {
                      setAttachedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className='text-muted-foreground hover:text-foreground'
                    aria-label='حذف پیوست'
                  >
                    <X className='size-3.5' />
                  </button>
                </div>
              )}

              <div className='flex items-center gap-2 max-w-3xl mx-auto'>
                <input
                  ref={fileInputRef}
                  type='file'
                  className='hidden'
                  onChange={e => setAttachedFile(e.target.files?.[0] ?? null)}
                />

                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='size-8 rounded-full grid place-items-center text-muted-foreground hover:bg-muted transition-colors shrink-0'
                  aria-label='پیوست فایل'
                >
                  <Paperclip className='size-4' />
                </button>

                <div className='flex-1'>
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder={replyTo ? 'پاسخ خود را بنویسید...' : 'پیام خود را بنویسید...'}
                    dir='rtl'
                    rows={1}
                    className='w-full min-h-11 resize-none overflow-hidden rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm leading-6 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-shadow'
                    style={{ maxHeight: 120, overflowY: 'hidden' }}
                    onInput={e => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSubmitMessage();
                      }
                    }}
                  />
                </div>

                <Button
                  type='button'
                  size='icon'
                  className='size-10 rounded-xl shrink-0 self-center -translate-y-px'
                  disabled={isSending || (!draft.trim() && !attachedFile)}
                  onClick={() => void handleSubmitMessage()}
                >
                  {isSending ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : replyTo ? (
                    <Reply className='size-4' />
                  ) : (
                    <Send className='size-4' />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 grid place-items-center'>
            <div className='text-center space-y-3 px-4'>
              <MessageCircle className='size-12 text-muted-foreground/40 mx-auto' />
              <p className='font-medium text-muted-foreground'>گفتگویی انتخاب نشده</p>
              <p className='text-sm text-muted-foreground/70'>
                از لیست سمت راست یک مکالمه را انتخاب کنید یا پیام جدید بفرستید
              </p>
              <Button type='button' onClick={() => setComposeOpen(true)} className='gap-1.5'>
                <Plus className='size-4' />
                پیام جدید
              </Button>
            </div>
          </div>
        )}
      </div>

      <NewMessageDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSent={async receiverId => {
          const { data: nextConversations } = await refetchConversations();
          const match = nextConversations?.find(c => c.otherUserId === receiverId);
          if (match) {
            selectConversation(match.id);
          }
        }}
      />
    </div>
  );
}
