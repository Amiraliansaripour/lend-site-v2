'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface OtpVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: (data: unknown) => void;
  userId: string;
  otpLength?: number;
  sendOtpApi: (userId: string) => Promise<unknown>;
  verifyOtpApi: (
    userId: string,
    otp: string,
  ) => Promise<{
    isSuccess: boolean;
    message: string;
    responseData?: unknown;
  }>;
  title?: string;
  descriptionText?: string;
}

export function OtpVerification({
  isOpen,
  onClose,
  onVerifySuccess,
  userId,
  otpLength = 5,
  sendOtpApi,
  verifyOtpApi,
  title = 'تایید شماره موبایل',
  descriptionText,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = useCallback(async () => {
    try {
      setIsLoading(true);
      await sendOtpApi(userId);
      toast.success('کد تایید ارسال شد');
      setCountdown(120);
      setCanResend(false);
    } catch {
      toast.error('خطا در ارسال کد تایید');
    } finally {
      setIsLoading(false);
    }
  }, [userId, sendOtpApi]);

  useEffect(() => {
    if (isOpen && userId) {
      void handleSendOtp();
    }
  }, [isOpen, userId, handleSendOtp]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newOtp = [...otp];

    for (let i = 0; i < Math.min(pastedData.length, otpLength); i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[otpLength - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');

    if (otpString.length !== otpLength) {
      toast.error(`لطفا کد ${otpLength} رقمی را وارد کنید`);
      return;
    }

    try {
      setIsLoading(true);
      const result = await verifyOtpApi(userId, otpString);

      if (result.isSuccess) {
        toast.success(result.message);
        onVerifySuccess(result.responseData);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('خطا در تایید کد');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {descriptionText || `لطفا کد ${otpLength} رقمی پیامک شده را وارد کنید.`}
          </DialogDescription>
        </DialogHeader>

        <div className='flex justify-center gap-2 my-6' dir='ltr'>
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={el => {
                inputRefs.current[index] = el;
              }}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className='w-12 h-12 text-center text-lg font-bold'
              disabled={isLoading}
            />
          ))}
        </div>

        <div className='flex flex-col gap-3'>
          <Button
            onClick={handleVerify}
            disabled={isLoading || otp.some(digit => !digit)}
            className='w-full'
          >
            {isLoading ? 'در حال تایید...' : 'تایید'}
          </Button>

          {canResend ? (
            <Button
              onClick={handleSendOtp}
              disabled={isLoading}
              variant='outline'
              className='w-full'
            >
              ارسال مجدد کد
            </Button>
          ) : (
            <p className='text-center text-sm text-muted-foreground'>
              ارسال مجدد کد در {countdown} ثانیه
            </p>
          )}

          <Button onClick={onClose} variant='ghost' className='w-full'>
            انصراف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
