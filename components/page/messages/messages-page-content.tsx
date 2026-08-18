'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import {
  Building2,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Store,
  UserCog,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export type ConversationRole = 'admin' | 'store' | 'organization' | 'guarantor';
type MessageKind = 'text' | 'image' | 'file';

interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  kind: MessageKind;
  content: string;
  time: string;
  fileName?: string;
  fileSize?: string;
  read?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  role: ConversationRole;
  roleLabel: string;
  avatar: string;
  phone?: string;
  unread: number;
  online?: boolean;
  messages: ChatMessage[];
}

export const ROLE_META: Record<
  ConversationRole,
  {
    label: string;
    color: string;
    bg: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  admin: {
    label: 'ادمین',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    dot: 'bg-violet-500',
    icon: UserCog,
  },
  store: {
    label: 'فروشگاه',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: Store,
  },
  organization: {
    label: 'سازمان',
    color: 'text-sky-600',
    bg: 'bg-sky-50 border-sky-200',
    dot: 'bg-sky-500',
    icon: Building2,
  },
  guarantor: {
    label: 'تضمین‌کننده',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
    icon: ShieldCheck,
  },
};

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'پشتیبانی سیستم',
    role: 'admin',
    roleLabel: 'ادمین',
    avatar: 'پش',
    unread: 2,
    online: true,
    messages: [
      {
        id: 'm1',
        sender: 'other',
        kind: 'text',
        content: 'سلام، مدارک شما بررسی شد و یک مورد نیاز به اصلاح دارد.',
        time: '۳ ساعت پیش',
        read: true,
      },
      {
        id: 'm2',
        sender: 'other',
        kind: 'file',
        content: 'فرم اصلاح اطلاعات',
        fileName: 'correction-form.pdf',
        fileSize: '۱.۲ مگابایت',
        time: '۲ ساعت پیش',
        read: true,
      },
      {
        id: 'm3',
        sender: 'me',
        kind: 'text',
        content: 'ممنون. الان بررسی می‌کنم.',
        time: '۴۵ دقیقه پیش',
        read: true,
      },
      {
        id: 'm4',
        sender: 'other',
        kind: 'text',
        content: 'بعد از اعمال اصلاحات روی همین گفتگو پیام دهید.',
        time: '۲۰ دقیقه پیش',
        read: false,
      },
      {
        id: 'm5',
        sender: 'other',
        kind: 'text',
        content: 'وضعیت درخواست اعتبار شما در حال بررسی است.',
        time: '۵ دقیقه پیش',
        read: false,
      },
    ],
  },
  {
    id: '2',
    name: 'فروشگاه پوشاک مد',
    role: 'store',
    roleLabel: 'فروشگاه',
    avatar: 'فپ',
    phone: 'کد پذیرنده: M-902',
    unread: 3,
    online: true,
    messages: [
      {
        id: 'm11',
        sender: 'other',
        kind: 'text',
        content: 'سلام، سفارش شما آماده ارسال است. آدرس نهایی را تایید می‌کنید؟',
        time: '۵۰ دقیقه پیش',
        read: true,
      },
      {
        id: 'm12',
        sender: 'me',
        kind: 'text',
        content: 'بله، آدرس پروفایل صحیح است.',
        time: '۴۵ دقیقه پیش',
        read: true,
      },
      {
        id: 'm13',
        sender: 'other',
        kind: 'image',
        content: '/images/folderIcon.png',
        time: '۳۵ دقیقه پیش',
        read: false,
      },
      {
        id: 'm14',
        sender: 'other',
        kind: 'text',
        content: 'رسید پرداخت را بررسی کنید.',
        time: '۳۰ دقیقه پیش',
        read: false,
      },
      {
        id: 'm15',
        sender: 'other',
        kind: 'text',
        content: 'تراکنش شما با موفقیت ثبت شد.',
        time: '۲۵ دقیقه پیش',
        read: false,
      },
    ],
  },
  {
    id: '3',
    name: 'شرکت فناوری پارس',
    role: 'organization',
    roleLabel: 'سازمان',
    avatar: 'شف',
    phone: 'شناسه سازمان: ۱۰۲۴',
    unread: 1,
    messages: [
      {
        id: 'm21',
        sender: 'other',
        kind: 'text',
        content: 'پرونده شما وارد مرحله بررسی نهایی شد.',
        time: '۲ ساعت پیش',
        read: true,
      },
      {
        id: 'm22',
        sender: 'other',
        kind: 'file',
        content: 'گزارش اعتبارسنجی',
        fileName: 'credit-report.pdf',
        fileSize: '۲.۱ مگابایت',
        time: '۱ ساعت پیش',
        read: true,
      },
      {
        id: 'm23',
        sender: 'other',
        kind: 'text',
        content: 'لیست کاربران جدید را ارسال کردیم.',
        time: '۴۵ دقیقه پیش',
        read: false,
      },
    ],
  },
  {
    id: '4',
    name: 'فروشگاه لوازم خانگی آریا',
    role: 'store',
    roleLabel: 'فروشگاه',
    avatar: 'فل',
    phone: 'کد پذیرنده: M-458',
    unread: 0,
    messages: [
      {
        id: 'm31',
        sender: 'me',
        kind: 'text',
        content: 'سلام، فاکتور را ارسال کردم.',
        time: '۳ ساعت پیش',
        read: true,
      },
      {
        id: 'm32',
        sender: 'other',
        kind: 'text',
        content: 'تراکنش دیروز تسویه شد.',
        time: '۲ ساعت پیش',
        read: true,
      },
    ],
  },
  {
    id: '5',
    name: 'علی رضایی',
    role: 'guarantor',
    roleLabel: 'تضمین‌کننده',
    avatar: 'عر',
    phone: '۰۹۳۵۶۷۸۹۰۱۲',
    unread: 0,
    messages: [
      {
        id: 'm41',
        sender: 'me',
        kind: 'text',
        content: 'سلام، لطفا تصویر چک پشت و رو را ارسال کنید.',
        time: 'دیروز',
        read: true,
      },
      {
        id: 'm42',
        sender: 'other',
        kind: 'file',
        content: 'تصویر چک',
        fileName: 'cheque-scan.jpg',
        fileSize: '۸۴۰ کیلوبایت',
        time: 'دیروز',
        read: true,
      },
    ],
  },
];

type RoleFilter = 'all' | ConversationRole;

const FILTER_DEFS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'همه' },
  { value: 'admin', label: 'ادمین' },
  { value: 'store', label: 'فروشگاه' },
  { value: 'organization', label: 'سازمان' },
  { value: 'guarantor', label: 'تضمین‌کننده' },
];

function lastMessagePreview(conv: Conversation): string {
  const last = conv.messages[conv.messages.length - 1];
  if (!last) return '';
  if (last.kind === 'image') return '📷 تصویر ارسال شد';
  if (last.kind === 'file') return `📎 ${last.fileName ?? 'فایل'}`;
  return last.content;
}

/** Total unread across all conversations — exported so sidebar can use it */
export const TOTAL_UNREAD = CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

export function MessagesPageContent() {
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(CONVERSATIONS[0]?.id);
  const [draft, setDraft] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const scrollFilters = useCallback((dir: 'left' | 'right') => {
    const el = filterScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -80 : 80, behavior: 'smooth' });
  }, []);

  const unreadByRole = useMemo<Record<RoleFilter, number>>(() => {
    const map: Record<RoleFilter, number> = {
      all: 0,
      admin: 0,
      store: 0,
      organization: 0,
      guarantor: 0,
    };
    for (const c of CONVERSATIONS) {
      map.all += c.unread;
      map[c.role] += c.unread;
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    return CONVERSATIONS.filter(c => {
      if (filter !== 'all' && c.role !== filter) return false;
      if (search.trim() && !c.name.includes(search.trim())) return false;
      return true;
    });
  }, [filter, search]);

  const active = CONVERSATIONS.find(c => c.id === activeId) ?? null;

  const selectConversation = (id: string) => {
    setActiveId(id);
    setMobileShowChat(true);
  };

  return (
    /* outer wrapper: fixed height so both panels scroll independently */
    <div
      className='flex rounded-2xl border border-border/60 overflow-hidden bg-background shadow-sm'
      style={{ height: 'calc(100vh - 10rem)' }}
    >
      {/* ──────────────── Sidebar: conversation list ──────────────── */}
      <div
        className={cn(
          'flex flex-col border-l border-border/60 bg-muted/20 min-h-0',
          'w-full xl:w-96 xl:min-w-96 shrink-0',
          mobileShowChat && 'hidden xl:flex',
        )}
      >
        {/* fixed header — never scrolls */}
        <div className='px-4 pt-4 pb-3 space-y-3 shrink-0'>
          <div className='flex items-center justify-between'>
            <h2 className='text-base font-bold'>پیام‌های دریافتی</h2>
            {TOTAL_UNREAD > 0 && (
              <span className='text-xs text-muted-foreground'>{TOTAL_UNREAD} خوانده‌نشده</span>
            )}
          </div>

          <div className='relative'>
            <Search className='size-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='جستجو در پیام‌ها...'
              className='pr-9 h-9 text-sm bg-background'
            />
          </div>

          {/* role filter pills — horizontal scroll with arrow buttons */}
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={() => scrollFilters('right')}
              className='shrink-0 size-6 rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors grid place-items-center'
              aria-label='اسکرول راست'
            >
              <ChevronRight className='size-3' />
            </button>

            <div
              ref={filterScrollRef}
              className='flex gap-1.5 overflow-x-auto scrollbar-none flex-1'
              style={{ scrollbarWidth: 'none' }}
            >
              {FILTER_DEFS.map(f => {
                const count = unreadByRole[f.value];
                const isActive = filter === f.value;
                return (
                  <button
                    key={f.value}
                    type='button'
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:bg-muted',
                    )}
                  >
                    {f.label}
                    {count > 0 && (
                      <span
                        className={cn(
                          'inline-flex items-center justify-center text-[10px] font-bold rounded-full min-w-4 h-4 px-1',
                          isActive
                            ? 'bg-white/30 text-white'
                            : 'bg-primary text-primary-foreground',
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type='button'
              onClick={() => scrollFilters('left')}
              className='shrink-0 size-6 rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors grid place-items-center'
              aria-label='اسکرول چپ'
            >
              <ChevronLeft className='size-3' />
            </button>
          </div>
        </div>

        {/* scrollable conversation list — takes remaining height */}
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <div className='px-2 pb-2'>
            {filtered.length === 0 && (
              <p className='text-center text-sm text-muted-foreground py-10'>گفتگویی یافت نشد</p>
            )}

            {filtered.map(conv => {
              const meta = ROLE_META[conv.role];
              const isActive = activeId === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];

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
                      <div
                        className={cn(
                          'size-11 rounded-full grid place-items-center text-sm font-bold border',
                          meta.bg,
                          meta.color,
                        )}
                      >
                        {conv.avatar}
                      </div>
                      {conv.online && (
                        <span className='absolute bottom-0 left-0 size-3 rounded-full bg-emerald-500 border-2 border-background' />
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2'>
                        <span
                          className={cn(
                            'font-semibold text-sm truncate',
                            conv.unread > 0 && 'text-foreground',
                          )}
                        >
                          {conv.name}
                        </span>
                        <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                          {lastMsg?.time}
                        </span>
                      </div>

                      <div className='flex items-center gap-1.5 mt-0.5'>
                        <Badge
                          variant='outline'
                          className={cn(
                            'text-[10px] px-1.5 py-0 h-4.5 border',
                            meta.bg,
                            meta.color,
                          )}
                        >
                          <meta.icon className='size-2.5 ml-0.5' />
                          {conv.roleLabel}
                        </Badge>
                        {conv.phone && (
                          <span className='text-[10px] text-muted-foreground truncate'>
                            {conv.phone}
                          </span>
                        )}
                      </div>

                      <div className='flex items-center justify-between gap-2 mt-1'>
                        <p
                          className={cn(
                            'text-xs truncate',
                            conv.unread > 0
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground',
                          )}
                        >
                          {lastMessagePreview(conv)}
                        </p>
                        {conv.unread > 0 && (
                          <span className='size-5 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center font-bold shrink-0'>
                            {conv.unread}
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

      {/* ──────────────── Chat area ──────────────── */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 min-h-0 bg-background',
          !mobileShowChat && 'hidden xl:flex',
        )}
      >
        {active ? (
          <>
            {/* fixed chat header */}
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
                <div
                  className={cn(
                    'size-10 rounded-full grid place-items-center text-sm font-bold border shrink-0',
                    ROLE_META[active.role].bg,
                    ROLE_META[active.role].color,
                  )}
                >
                  {active.avatar}
                </div>
                <div className='min-w-0'>
                  <p className='font-semibold text-sm'>{active.name}</p>
                  {active.phone && <p className='text-xs text-muted-foreground'>{active.phone}</p>}
                </div>
              </div>

              <Badge
                variant='outline'
                className={cn(
                  'border shrink-0',
                  ROLE_META[active.role].bg,
                  ROLE_META[active.role].color,
                )}
              >
                {active.roleLabel}
              </Badge>
            </div>

            {/* scrollable messages — takes remaining space between header & composer */}
            <div className='flex-1 min-h-0 overflow-y-auto bg-muted/10'>
              <div className='px-5 py-4 space-y-3 max-w-3xl mx-auto'>
                {active.messages.map(msg => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex', isMe ? 'justify-start' : 'justify-end')}
                    >
                      <div
                        className={cn(
                          'max-w-[65%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-background border border-border rounded-bl-sm',
                        )}
                      >
                        {msg.kind === 'text' && <p>{msg.content}</p>}

                        {msg.kind === 'image' && (
                          <div className='space-y-1.5'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.content}
                              alt='تصویر'
                              className='rounded-xl w-full max-w-56 max-h-44 object-cover border border-border/40'
                            />
                            <p className='text-[11px] opacity-60'>تصویر ارسالی</p>
                          </div>
                        )}

                        {msg.kind === 'file' && (
                          <div
                            className={cn(
                              'flex items-center gap-3 rounded-xl border px-3 py-2 min-w-48',
                              isMe ? 'border-white/20 bg-white/10' : 'border-border bg-muted/40',
                            )}
                          >
                            <div
                              className={cn(
                                'size-9 rounded-lg grid place-items-center shrink-0',
                                isMe ? 'bg-white/15' : 'bg-primary/10',
                              )}
                            >
                              <FileText
                                className={cn('size-4', isMe ? 'text-white' : 'text-primary')}
                              />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium truncate'>{msg.content}</p>
                              <p
                                className={cn(
                                  'text-[11px]',
                                  isMe ? 'text-white/60' : 'text-muted-foreground',
                                )}
                              >
                                {msg.fileName} • {msg.fileSize}
                              </p>
                            </div>
                            <Download
                              className={cn(
                                'size-4 shrink-0',
                                isMe ? 'text-white/60' : 'text-muted-foreground',
                              )}
                            />
                          </div>
                        )}

                        <div
                          className={cn(
                            'flex items-center gap-1 mt-1.5',
                            isMe ? 'justify-start' : 'justify-end',
                          )}
                        >
                          <span
                            className={cn(
                              'text-[10px]',
                              isMe ? 'text-white/60' : 'text-muted-foreground',
                            )}
                          >
                            {msg.time}
                          </span>
                          {isMe &&
                            (msg.read ? (
                              <CheckCheck className='size-3 text-white/60' />
                            ) : (
                              <Check className='size-3 text-white/60' />
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* fixed composer */}
            <div className='border-t border-border/60 bg-background px-4 py-3 shrink-0'>
              <div className='flex items-center gap-2 max-w-3xl mx-auto'>
                <div className='flex items-center gap-1 shrink-0'>
                  {[Paperclip, ImageIcon, Smile].map((Icon, i) => (
                    <button
                      key={i}
                      type='button'
                      className='size-8 rounded-full grid place-items-center text-muted-foreground hover:bg-muted transition-colors'
                    >
                      <Icon className='size-4' />
                    </button>
                  ))}
                </div>

                <div className='flex-1'>
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder='پیام خود را بنویسید...'
                    dir='rtl'
                    rows={1}
                    className='w-full min-h-11 resize-none overflow-hidden rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm leading-6 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-shadow'
                    style={{ maxHeight: 120, overflowY: 'hidden' }}
                    onInput={e => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                    }}
                  />
                </div>

                <Button
                  type='button'
                  size='icon'
                  className='size-10 rounded-xl shrink-0 self-center -translate-y-px'
                  disabled={!draft.trim()}
                >
                  <Send className='size-4' />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 grid place-items-center'>
            <div className='text-center space-y-2 px-4'>
              <MessageCircle className='size-12 text-muted-foreground/40 mx-auto' />
              <p className='font-medium text-muted-foreground'>گفتگویی انتخاب نشده</p>
              <p className='text-sm text-muted-foreground/70'>
                از لیست سمت راست یک مکالمه را انتخاب کنید
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
