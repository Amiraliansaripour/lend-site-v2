'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatNumber } from '@/utils/format';
import { beginingText, entireText } from './text';
import { useSiteTemplate } from '@/providers/site-template';

interface CreditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  price?: number;
  onConfirm?: () => void;
  isCheckRequired?: boolean;
}

export function CreditModal({
  isOpen,
  onOpenChange,
  price,
  onConfirm,
  isCheckRequired = false,
}: CreditModalProps) {
  const { withBrand } = useSiteTemplate();
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [checkNational, setCheckedNational] = useState(false);
  const [checkedFee, setCheckedFee] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleConfirm = () => {
    const isValid = !isCheckRequired
      ? checkedFee && checkNational
      : checkedTerms && checkedFee && checkNational;

    if (isValid) {
      onOpenChange(false);
      if (onConfirm) {
        onConfirm();
      }
    }
  };
  const isConfirmDisabled = !isCheckRequired
    ? !checkedFee || !checkNational
    : !checkedTerms || !checkedFee || !checkNational;

  const boxClass = 'p-5 text-black bg-[#EDEDED] rounded-[4px] text-sm lg:text-base text-center';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className=''>
          <DialogHeader className='text-center sm:text-center'>
            <DialogTitle className='text-base lg:text-xl font-semibold text-center'>
              نکات قابل توجه جهت درخواست اعتبار (کیف پول اعتباری)
            </DialogTitle>
            <DialogDescription className='text-[#454545] text-sm lg:text-base text-center'>
              پیش از ثبت درخواست خود بهتر است به موارد زیر توجه کنید:
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className='max-h-[60vh]  px-2' dir='rtl'>
            <div className='flex flex-col gap-4 pr-2'>
              <div className={boxClass}>
                امکان دریافت تسهیلات به صورت نقدی وجود ندارد و تنها اعتبار خرید به شما تخصیص می
                یابد.
              </div>
              <div className={boxClass}>
                تکمیل مدارک، داشتن رتبه اعتباری مناسب و داشتن دسته چک، سه شرط اصلی برای بررسی
                درخواست شماست.
              </div>
              <div className={boxClass}>
                به دلیل کارمزدهای مربوط به تشکیل پرونده و فرآیندهای ارزیابی، مبلغ نهایی خرید نقدی و
                اقساطی متفاوت خواهد بود.
              </div>
              <div className={boxClass}>
                <div className='text-dark-blue text-base lg:text-lg mb-4'>هزینه اعتبارسنجی</div>
                <div className='text-[#454545] mb-7'>
                  این مبلغ جهت استفاده از سرویس‌های برخط پرداخت می‌شود.
                </div>
                <div className='text-black mt-4 pb-2'>اعتبارسنجی بانکی</div>
                <div className='flex justify-between text-[#454545]'>
                  <div className='text-xs lg:text-sm'>
                    تایید خوش حسابی شما در سیستم بانکی به وسیله شرکت مشاوره رتبه بندی ایرانیان
                  </div>
                </div>
                <div className='text-black mt-4 pb-2'>سنجش ظرفیت اعتبار</div>
                <div className='flex justify-between text-[#454545]'>
                  <div className='text-xs lg:text-sm'>بررسی میزان اعتبار قابل دریافت شما</div>
                  {price ? (
                    <div className='text-black whitespace-nowrap'>
                      {formatNumber(price.toString())} ریال
                    </div>
                  ) : (
                    <div className='text-black whitespace-nowrap'>-</div>
                  )}
                </div>
              </div>

              <div className='mt-4 py-4 lg:py-7 border-t border-b border-[#A9A9A9] flex flex-col gap-6'>
                {isCheckRequired && (
                  <div className='flex gap-4 items-center'>
                    <Checkbox
                      id='credit-terms'
                      checked={checkedTerms}
                      onCheckedChange={checked => setCheckedTerms(checked as boolean)}
                    />
                    <label htmlFor='credit-terms' className='text-xs lg:text-sm cursor-pointer'>
                      دارای دسته چک به نام خودم هستم.
                    </label>
                  </div>
                )}
                <div className='flex gap-4 items-center'>
                  <Checkbox
                    id='number-national'
                    checked={checkNational}
                    onCheckedChange={checked => setCheckedNational(checked as boolean)}
                  />
                  <label htmlFor='number-national' className='text-xs lg:text-sm cursor-pointer'>
                    تعهد مینمایم کد ملی و شماره همراه مطابقت دارد
                  </label>
                </div>
                <div className='flex gap-4 items-center'>
                  <Checkbox
                    id='credit-fee'
                    checked={checkedFee}
                    onCheckedChange={checked => setCheckedFee(checked as boolean)}
                  />
                  <label htmlFor='credit-fee' className='text-xs lg:text-sm cursor-pointer'>
                    مفاهیم را خوانده و{' '}
                    <button
                      type='button'
                      onClick={() => setShowTermsModal(true)}
                      className='text-[#C81E1E] underline hover:text-red-700 transition-colors'
                    >
                      قوانین
                    </button>{' '}
                    را پذیرفته ام.
                  </label>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className='flex gap-3 justify-end'>
            <Button variant='outline' onClick={() => onOpenChange(false)} className='rounded'>
              انصراف
            </Button>
            <Button
              className='rounded bg-[#939393] hover:bg-[#7a7a7a] text-white'
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
            >
              تایید و ادامه
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className='max-w-4xl max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle className='text-lg font-semibold'>
              شرایط و قوانین استفاده از خدمات
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className='max-h-[60vh]'>
            <div className='text-sm lg:text-base text-gray-700 leading-7 space-y-4 pr-4'>
              <div className='bg-blue-50 p-4 rounded-lg border-r-4 border-blue-400'>
                <p className='text-justify'>{withBrand(beginingText)}</p>
              </div>

              <div className='space-y-4'>
                {entireText.split('\n').map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <p key={index} className='text-justify leading-relaxed'>
                        {withBrand(paragraph.trim())}
                      </p>
                    ),
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className='flex gap-3 justify-end'>
            <Button variant='outline' onClick={() => setShowTermsModal(false)} className='rounded'>
              بستن
            </Button>
            <Button
              className='rounded bg-primary text-white hover:bg-primary/90'
              onClick={() => {
                setShowTermsModal(false);
                setCheckedFee(true);
              }}
            >
              موافقم و می‌پذیرم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
