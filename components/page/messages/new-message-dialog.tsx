'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Paperclip, Send, X } from 'lucide-react';
import { toast } from 'sonner';

import { uploadAttachment } from '@/api/facility';
import { MESSAGE_ATTACHMENT_TYPE } from '@/api/message';
import { useSendMessage } from '@/mutations/message';
import { useAdmins } from '@/queries/message';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type NewMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: (receiverId: string) => void;
};

export function NewMessageDialog({ open, onOpenChange, onSent }: NewMessageDialogProps) {
  const { data: admins = [], isLoading: isLoadingAdmins } = useAdmins(open);
  const sendMutation = useSendMessage();

  const [receiverId, setReceiverId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setReceiverId('');
      setSubject('');
      setBody('');
      setFile(null);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (!receiverId) {
      toast.error('گیرنده را انتخاب کنید');
      return;
    }
    if (!subject.trim()) {
      toast.error('موضوع پیام را وارد کنید');
      return;
    }
    if (!body.trim()) {
      toast.error('متن پیام را وارد کنید');
      return;
    }

    try {
      let attachmentId: string | null = null;

      if (file) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('Name', file.name);
        formData.append('attachmentType', String(MESSAGE_ATTACHMENT_TYPE));
        formData.append('file', file);
        const uploaded = await uploadAttachment(formData);
        attachmentId = uploaded.id;
      }

      const result = await sendMutation.mutateAsync({
        receiverId,
        subject: subject.trim(),
        body: body.trim(),
        attachmentId,
      });

      if (result?.isSuccess === false) {
        toast.error(result.message || 'ارسال پیام ناموفق بود');
        return;
      }

      toast.success('پیام با موفقیت ارسال شد');
      onOpenChange(false);
      onSent?.(receiverId);
    } catch {
      toast.error('خطا در ارسال پیام');
    } finally {
      setIsUploading(false);
    }
  }, [receiverId, subject, body, file, sendMutation, onOpenChange, onSent]);

  const isSubmitting = isUploading || sendMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>پیام جدید</DialogTitle>
          <DialogDescription>پیام خود را برای یکی از ادمین‌ها ارسال کنید.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-1'>
          <div className='space-y-2'>
            <Label htmlFor='receiver'>گیرنده</Label>
            <Select value={receiverId} onValueChange={setReceiverId} disabled={isLoadingAdmins}>
              <SelectTrigger id='receiver' className='w-full'>
                <SelectValue
                  placeholder={isLoadingAdmins ? 'در حال بارگذاری...' : 'انتخاب ادمین'}
                />
              </SelectTrigger>
              <SelectContent>
                {admins.map(admin => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {[admin.firstName, admin.lastName].filter(Boolean).join(' ') || admin.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='subject'>موضوع</Label>
            <Input
              id='subject'
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder='موضوع پیام'
              dir='rtl'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='body'>متن پیام</Label>
            <Textarea
              id='body'
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder='پیام خود را بنویسید...'
              dir='rtl'
              rows={4}
            />
          </div>

          <div className='space-y-2'>
            <Label>پیوست (اختیاری)</Label>
            <input
              ref={fileInputRef}
              type='file'
              className='hidden'
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className='flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm'>
                <Paperclip className='size-4 shrink-0 text-muted-foreground' />
                <span className='truncate flex-1'>{file.name}</span>
                <button
                  type='button'
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className='text-muted-foreground hover:text-foreground'
                  aria-label='حذف فایل'
                >
                  <X className='size-4' />
                </button>
              </div>
            ) : (
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className='size-4' />
                انتخاب فایل
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button type='button' onClick={handleSubmit} disabled={isSubmitting} className='gap-2'>
            {isSubmitting ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Send className='size-4' />
            )}
            ارسال
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
