'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, User, FileText, TrendingUp, DollarSign, BarChart3, Shield } from 'lucide-react';
import { useRequestPreview } from '@/queries/request';
import { useUser } from '@/queries/users';
import { useConfirmRequestByUser, useChangeRequestState } from '@/mutations/request';
import { REQUEST_STATE_CANCELLED } from '@/utils/request-status';
import { useRouter } from '@/i18n/navigation';
import { previewImageToSrc, resolveAttachmentImageSrc } from '@/lib/image-file';
import { getShopImageUrl } from '@/lib/shop-utils';
import type { RequestPreviewAttachment } from '@/api/request';

interface AcceptByUserProps {
  requestId: string;
  userId: string;
  ruleText?: string | null;
  onConfirm?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

function PreviewThumb({
  src,
  alt,
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: (src: string) => void;
}) {
  return (
    <button
      type='button'
      className='relative h-24 w-24 overflow-hidden rounded-md hover:opacity-80'
      onClick={() => onOpen(src)}
      title='برای مشاهده تصویر کامل کلیک کنید'
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className='h-full w-full object-cover' />
    </button>
  );
}

export function AcceptByUser({
  requestId,
  userId,
  ruleText,
  onBack,
  onCancel,
  isReadOnly = false,
}: AcceptByUserProps) {
  const router = useRouter();
  const { data: requestData, isLoading: isLoadingRequest } = useRequestPreview(requestId);
  const { data: userData, isLoading: isLoadingUser } = useUser(userId);
  const confirmRequestMutation = useConfirmRequestByUser();
  const changeRequestStateMutation = useChangeRequestState();

  const [isChecked, setIsChecked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const userAttachments: RequestPreviewAttachment[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((userData as any)?.attachments as RequestPreviewAttachment[] | undefined) ||
    requestData?.userAttachments ||
    [];

  const loading = isLoadingRequest || isLoadingUser;

  const formatAmount = (amount?: number | string | null): string => {
    const numeric = typeof amount === 'string' ? Number(amount) : amount;
    if (numeric === undefined || numeric === null || isNaN(Number(numeric))) return 'نامشخص';
    const rounded = Math.round(Number(numeric));
    return `${rounded.toLocaleString('fa-IR')} ریال`;
  };

  const resolveImageSrc = (value?: string | null, filePath?: string | null): string | null => {
    return previewImageToSrc(value) || getShopImageUrl(filePath);
  };

  const openImageModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageModalOpen(true);
  };

  const handleConfirm = async () => {
    if (isReadOnly) return;

    if (!isChecked) {
      toast.error('لطفا شرایط را مطالعه و تایید کنید');
      return;
    }

    if (!requestId) {
      toast.error('شناسه درخواست نامشخص است.');
      return;
    }

    confirmRequestMutation.mutate(requestId, {
      onSuccess: result => {
        if (result.isSuccess) {
          toast.success('درخواست شما با موفقیت تایید شد');
          router.push('/requests');
        } else {
          toast.error('خطا در تایید درخواست');
        }
      },
      onError: () => {
        toast.error('مشکلی در ارتباط با سرور پیش آمده است.');
      },
    });
  };

  const handleCancellation = async () => {
    if (onCancel) {
      onCancel();
      return;
    }

    setIsCancelling(true);
    try {
      await changeRequestStateMutation.mutateAsync({
        id: requestId,
        requestState: REQUEST_STATE_CANCELLED,
      });
      toast.success('درخواست شما با موفقیت لغو شد');
      router.push('/requests');
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).response?.data?.message
          : undefined;
      toast.error(msg || 'خطا در لغو درخواست');
    } finally {
      setIsCancelling(false);
    }
  };

  const recieveAmount = requestData?.creditAmount
    ? requestData.creditAmount -
      requestData.creditAmount /
        Math.floor((requestData.planFirstSystemFee || 0) + (requestData.planFirstBankFee || 0))
    : 0;

  const identityImages = [
    ...userAttachments
      .map(attachment => resolveAttachmentImageSrc(attachment, null, getShopImageUrl))
      .filter((src): src is string => Boolean(src)),
    ...(requestData?.userFileImage || [])
      .map(image => previewImageToSrc(image))
      .filter((src): src is string => Boolean(src)),
  ].filter((src, index, all) => all.indexOf(src) === index);

  const incomeAttachments = requestData?.incomeInfoAttachments || [];
  const incomeFileImages = requestData?.incomeInfoFileImage || [];
  const incomeImages = [
    ...incomeAttachments.map((attachment, index) =>
      resolveAttachmentImageSrc(attachment, incomeFileImages[index], getShopImageUrl),
    ),
    ...incomeFileImages.map(image => previewImageToSrc(image)),
  ].filter((src, index, all): src is string => Boolean(src) && all.indexOf(src) === index);

  const planGuaranteesLabel = requestData?.planGuarantees?.length
    ? requestData.planGuarantees.join(' و ')
    : null;

  const chequeImageSrc = resolveImageSrc(
    requestData?.chequeFileImage,
    requestData?.chequeAttachmentFilePath,
  );
  const chequeBackImageSrc = resolveImageSrc(
    requestData?.chequeFileImageBack,
    requestData?.chequeAttachmentBackFilePath,
  );
  const promissoryImageSrc = resolveImageSrc(
    requestData?.chequeFileImagePromissory,
    requestData?.chequeAttachmentPromissoryFilePath,
  );
  const salaryDeductionImageSrc = resolveImageSrc(
    requestData?.chequeFileImageDeductionSalary,
    requestData?.chequeAttachmentDeductionSalaryFilePath,
  );
  const invoiceImageSrc = resolveImageSrc(
    requestData?.invoiceFileImage,
    requestData?.invoiceAttachmentFilePath,
  );

  if (loading) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center min-h-[400px]'>
          <Loader2 className='w-16 h-16 animate-spin text-primary mb-4' />
          <p className='text-lg text-gray-700'>در حال بارگذاری اطلاعات...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className='space-y-6'>
        <div className='text-center'>
          <h2 className='font-bold text-3xl text-gray-900 mb-3 border-b-2 border-primary pb-2 inline-block'>
            جزئیات درخواست شما
          </h2>
          <p className='text-gray-600 text-lg'>
            در این بخش می‌توانید تمامی جزئیات مربوط به درخواست اعتبار خود را به دقت مشاهده و سپس
            تایید نمایید.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card className='hover:scale-[1.02] transition-transform'>
            <CardHeader className='bg-gradient-to-br from-blue-50 to-indigo-50'>
              <CardTitle className='flex items-center text-blue-700'>
                <User className='w-6 h-6 ml-2' />
                اطلاعات کاربر
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-6'>
              <div className='flex justify-between'>
                <span className='font-medium'>نام:</span>
                <span>{requestData?.userFirstName || 'نامشخص'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>نام خانوادگی:</span>
                <span>{requestData?.userLastName || 'نامشخص'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>کد ملی:</span>
                <span>{requestData?.userNationalCode || 'نامشخص'}</span>
              </div>
              <div>
                <span className='font-medium'>مدارک هویتی:</span>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {identityImages.length > 0 ? (
                    identityImages.map((src, index) => (
                      <PreviewThumb
                        key={`${src.slice(0, 24)}-${index}`}
                        src={src}
                        alt={`مدرک ${index + 1}`}
                        onOpen={openImageModal}
                      />
                    ))
                  ) : (
                    <span className='text-sm text-muted-foreground'>تصویری وجود ندارد</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='hover:scale-[1.02] transition-transform'>
            <CardHeader className='bg-gradient-to-br from-green-50 to-teal-50'>
              <CardTitle className='flex items-center text-green-700'>
                <FileText className='w-6 h-6 ml-2' />
                اطلاعات اعتبار
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-6'>
              {requestData?.chequeSayadId && (
                <div className='flex justify-between'>
                  <span className='font-medium'>شناسه صیاد چک:</span>
                  <span>{requestData.chequeSayadId}</span>
                </div>
              )}
              {chequeImageSrc && (
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>تصویر چک صیادی:</span>
                  <PreviewThumb src={chequeImageSrc} alt='تصویر چک صیادی' onOpen={openImageModal} />
                </div>
              )}
              {chequeBackImageSrc && (
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>تصویر پشت چک صیادی:</span>
                  <PreviewThumb
                    src={chequeBackImageSrc}
                    alt='تصویر پشت چک صیادی'
                    onOpen={openImageModal}
                  />
                </div>
              )}
              {promissoryImageSrc && (
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>تصویر سفته:</span>
                  <PreviewThumb src={promissoryImageSrc} alt='تصویر سفته' onOpen={openImageModal} />
                </div>
              )}
              {salaryDeductionImageSrc && (
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>تصویر گواهی کسر از حقوق:</span>
                  <PreviewThumb
                    src={salaryDeductionImageSrc}
                    alt='تصویر گواهی کسر از حقوق'
                    onOpen={openImageModal}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {(requestData?.incomeInfoIncome || requestData?.incomeInfoPayAbility) && (
            <Card className='lg:col-span-2 hover:scale-[1.02] transition-transform'>
              <CardHeader className='bg-gradient-to-br from-yellow-50 to-orange-50'>
                <CardTitle className='flex items-center text-orange-700'>
                  <TrendingUp className='w-6 h-6 ml-2' />
                  اطلاعات درآمدی
                </CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-6'>
                <div>
                  <span className='font-medium mb-1 block'>مقدار درآمد:</span>
                  <span className='font-semibold'>
                    {formatAmount(requestData.incomeInfoIncome)}
                  </span>
                </div>
                <div>
                  <span className='font-medium mb-1 block'>توانایی پرداخت قسط:</span>
                  <span className='font-semibold'>
                    {formatAmount(requestData.incomeInfoPayAbility)}
                  </span>
                </div>
                <div>
                  <span className='font-medium mb-1 block'>تصاویر اطلاعات درآمدی:</span>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {incomeImages.length > 0 ? (
                      incomeImages.map((src, index) => (
                        <PreviewThumb
                          key={`${src.slice(0, 24)}-${index}`}
                          src={src}
                          alt={`تصویر درآمدی ${index + 1}`}
                          onOpen={openImageModal}
                        />
                      ))
                    ) : (
                      <span className='text-sm text-muted-foreground'>تصویری وجود ندارد</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(requestData?.planName || requestData?.planPeriod || planGuaranteesLabel) && (
            <Card className='hover:scale-[1.02] transition-transform'>
              <CardHeader className='bg-gradient-to-br from-purple-50 to-pink-50'>
                <CardTitle className='flex items-center text-purple-700'>
                  <BarChart3 className='w-6 h-6 ml-2' />
                  جزئیات طرح
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 pt-6'>
                <div className='flex justify-between'>
                  <span className='font-medium'>نام طرح:</span>
                  <span>{requestData?.planName || 'نامشخص'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>درصد سود:</span>
                  <span>
                    {requestData?.planPercentage ? `${requestData.planPercentage}%` : 'نامشخص'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>تعداد اقساط:</span>
                  <span>{requestData?.planPeriod || requestData?.period || 'نامشخص'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>ضمانت‌های طرح:</span>
                  <span>{planGuaranteesLabel || 'نامشخص'}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {requestData?.planIsInvoiceRequired && invoiceImageSrc && (
            <Card className='hover:scale-[1.02] transition-transform'>
              <CardHeader className='bg-gradient-to-br from-amber-50 to-yellow-50'>
                <CardTitle className='flex items-center text-amber-700'>
                  <Shield className='w-6 h-6 ml-2' />
                  پیش فاکتور
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 pt-6'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>تصویر:</span>
                  <PreviewThumb
                    src={invoiceImageSrc}
                    alt='تصویر پیش فاکتور'
                    onOpen={openImageModal}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className='hover:scale-[1.02] transition-transform'>
            <CardHeader className='bg-gradient-to-br from-red-50 to-orange-50'>
              <CardTitle className='flex items-center text-red-700'>
                <DollarSign className='w-6 h-6 ml-2' />
                جزئیات مالی
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-6'>
              <div className='flex justify-between'>
                <span className='font-medium'>نام طرح:</span>
                <span className='font-semibold'>{requestData?.planName || 'نامشخص'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>دوره بازپرداخت:</span>
                <span className='font-semibold'>
                  {requestData?.period
                    ? `${requestData.period.toLocaleString('fa-IR')} ماه`
                    : 'نامشخص'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>مبلغ هر قسط:</span>
                <span className='font-semibold'>{formatAmount(requestData?.loanDetailAmount)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>مبلغ اعتبار:</span>
                <span className='font-semibold'>{formatAmount(requestData?.creditAmount)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>سود:</span>
                <span className='font-semibold'>{formatAmount(requestData?.feeAmount)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>اعتبار دریافتی:</span>
                <span className='font-semibold'>{formatAmount(recieveAmount)}</span>
              </div>
              <div className='flex justify-between border-t pt-2 text-lg font-bold text-green-700'>
                <span>مبلغ قابل پرداخت:</span>
                <span>{formatAmount(requestData?.totalRefundAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className='pt-6'>
            <div className='mb-6 flex flex-wrap items-center justify-center gap-2'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='terms-checkbox'
                  checked={isChecked}
                  disabled={isReadOnly}
                  onCheckedChange={checked => setIsChecked(checked === true)}
                />
                <label
                  htmlFor='terms-checkbox'
                  className='cursor-pointer text-sm font-medium md:text-lg'
                >
                  شرایط را مطالعه کرده‌ام و می‌پذیرم
                </label>
              </div>
              {ruleText && (
                <Button
                  type='button'
                  variant='link'
                  className='text-sm font-medium text-blue-600 underline hover:text-blue-800'
                  onClick={() => setIsRulesModalOpen(true)}
                >
                  مشاهده قوانین و مقررات
                </Button>
              )}
            </div>

            <div className='flex justify-center gap-4'>
              {!isReadOnly && (
                <Button
                  onClick={handleConfirm}
                  disabled={!isChecked || confirmRequestMutation.isPending}
                  size='lg'
                >
                  {confirmRequestMutation.isPending ? (
                    <>
                      <Loader2 className='ml-2 h-4 w-4 animate-spin' />
                      در حال ثبت...
                    </>
                  ) : (
                    'ثبت درخواست'
                  )}
                </Button>
              )}
              {onBack && (
                <Button type='button' variant='outline' size='lg' onClick={onBack}>
                  بازگشت
                </Button>
              )}
              {onCancel && (
                <Button
                  type='button'
                  variant='outline'
                  size='lg'
                  onClick={handleCancellation}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className='ml-2 h-4 w-4 animate-spin' />
                      در حال لغو...
                    </>
                  ) : (
                    'انصراف'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className='max-h-screen max-w-4xl p-2'>
          {selectedImage && (
            <div className='relative h-[80vh] w-full'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt='تصویر بزرگ شده'
                className='h-full w-full object-contain'
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRulesModalOpen} onOpenChange={setIsRulesModalOpen}>
        <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-base font-bold'>قوانین و مقررات طرح</DialogTitle>
          </DialogHeader>
          <div className='whitespace-pre-wrap text-sm'>{ruleText}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
