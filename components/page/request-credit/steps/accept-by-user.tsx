'use client';

import { useState } from 'react';
import Image from 'next/image';
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

interface AcceptByUserProps {
  requestId: string;
  userId: string;
  ruleText?: string | null;
  onConfirm?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
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

  // Derive user attachments from userData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userAttachments = (userData as any)?.attachments || [];

  const loading = isLoadingRequest || isLoadingUser;

  const formatAmount = (amount?: number): string => {
    if (!amount || isNaN(amount)) return 'نامشخص';
    const rounded = Math.round(Number(amount));
    return `${rounded.toLocaleString('fa-IR')} ریال`;
  };

  const createBase64ImageUrl = (base64String: string, mimeType = 'image/jpeg'): string => {
    return `data:${mimeType};base64,${base64String}`;
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
        console.log(result);
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
          {/* User Information Card */}
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
              {userAttachments.length > 0 && (
                <div>
                  <span className='font-medium'>مدارک هویتی:</span>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {userAttachments.map((attachment: any, index: number) => (
                      <div
                        key={index}
                        className='relative w-24 h-24 cursor-pointer hover:opacity-80 transition-opacity'
                        onClick={() => openImageModal(createBase64ImageUrl(attachment.file))}
                      >
                        <Image
                          src={createBase64ImageUrl(attachment.file)}
                          alt={`مدرک ${index + 1}`}
                          fill
                          className='object-cover rounded-md'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cheque & Guarantee Information Card */}
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
              {requestData?.chequeFileImage && (
                <div className='flex justify-between items-center'>
                  <span className='font-medium'>تصویر چک صیادی:</span>
                  <div
                    className='relative w-24 h-24 cursor-pointer hover:opacity-80'
                    onClick={() =>
                      openImageModal(createBase64ImageUrl(requestData.chequeFileImage!))
                    }
                  >
                    <Image
                      src={createBase64ImageUrl(requestData.chequeFileImage)}
                      alt='تصویر چک صیادی'
                      fill
                      className='object-cover rounded-md'
                    />
                  </div>
                </div>
              )}
              {requestData?.chequeFileImageBack && (
                <div className='flex justify-between items-center'>
                  <span className='font-medium'>تصویر پشت چک صیادی:</span>
                  <div
                    className='relative w-24 h-24 cursor-pointer hover:opacity-80'
                    onClick={() =>
                      openImageModal(createBase64ImageUrl(requestData.chequeFileImageBack!))
                    }
                  >
                    <Image
                      src={createBase64ImageUrl(requestData.chequeFileImageBack)}
                      alt='تصویر پشت چک صیادی'
                      fill
                      className='object-cover rounded-md'
                    />
                  </div>
                </div>
              )}
              {requestData?.chequeFileImagePromissory && (
                <div className='flex justify-between items-center'>
                  <span className='font-medium'>تصویر سفته:</span>
                  <div
                    className='relative w-24 h-24 cursor-pointer hover:opacity-80'
                    onClick={() =>
                      openImageModal(createBase64ImageUrl(requestData.chequeFileImagePromissory!))
                    }
                  >
                    <Image
                      src={createBase64ImageUrl(requestData.chequeFileImagePromissory)}
                      alt='تصویر سفته'
                      fill
                      className='object-cover rounded-md'
                    />
                  </div>
                </div>
              )}
              {requestData?.chequeFileImageDeductionSalary && (
                <div className='flex justify-between items-center'>
                  <span className='font-medium'>تصویر گواهی کسر از حقوق:</span>
                  <div
                    className='relative w-24 h-24 cursor-pointer hover:opacity-80'
                    onClick={() =>
                      openImageModal(
                        createBase64ImageUrl(requestData.chequeFileImageDeductionSalary!),
                      )
                    }
                  >
                    <Image
                      src={createBase64ImageUrl(requestData.chequeFileImageDeductionSalary)}
                      alt='تصویر گواهی کسر از حقوق'
                      fill
                      className='object-cover rounded-md'
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income Information Card */}
          {requestData?.incomeInfo && (
            <Card className='lg:col-span-2 hover:scale-[1.02] transition-transform'>
              <CardHeader className='bg-gradient-to-br from-yellow-50 to-orange-50'>
                <CardTitle className='flex items-center text-orange-700'>
                  <TrendingUp className='w-6 h-6 ml-2' />
                  اطلاعات درآمدی
                </CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-6'>
                <div>
                  <span className='font-medium block mb-1'>مقدار درآمد:</span>
                  <span className='font-semibold'>
                    {formatAmount(requestData.incomeInfo.income)}
                  </span>
                </div>
                <div>
                  <span className='font-medium block mb-1'>توانایی پرداخت قسط:</span>
                  <span className='font-semibold'>
                    {formatAmount(requestData.incomeInfo.payAbility)}
                  </span>
                </div>
                <div>
                  <span className='font-medium block mb-1'>تصاویر اطلاعات درآمدی:</span>
                  <span className='flex flex-wrap gap-2'>
                    {requestData.incomeInfo.incomeInfoFileImage &&
                    requestData.incomeInfo.incomeInfoFileImage.length > 0
                      ? requestData.incomeInfo.incomeInfoFileImage.map(
                          (image: string, index: number) => (
                            <a
                              key={index}
                              href={image}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:text-blue-800 hover:underline text-sm'
                            >
                              تصویر {index + 1}
                            </a>
                          ),
                        )
                      : 'تصویری وجود ندارد'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan Details Card */}
          {requestData?.plan && (
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
                  <span>{requestData.plan.planName || 'نامشخص'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>درصد سود:</span>
                  <span>
                    {requestData.plan.planPercentage
                      ? `${requestData.plan.planPercentage}%`
                      : 'نامشخص'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>تعداد اقساط:</span>
                  <span>{requestData.plan.planPeriod || 'نامشخص'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>ضمانت‌های طرح:</span>
                  <span>{requestData.plan.planGuarantees || 'نامشخص'}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice / Proforma Card */}
          {requestData?.planIsInvoiceRequired && requestData?.invoiceFileImage && (
            <Card className='hover:scale-[1.02] transition-transform'>
              <CardHeader className='bg-gradient-to-br from-amber-50 to-yellow-50'>
                <CardTitle className='flex items-center text-amber-700'>
                  <Shield className='w-6 h-6 ml-2' />
                  پیش فاکتور
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 pt-6'>
                <div className='flex justify-between items-center'>
                  <span className='font-medium'>تصویر:</span>
                  <div
                    className='relative w-24 h-24 cursor-pointer hover:opacity-80'
                    onClick={() =>
                      openImageModal(createBase64ImageUrl(requestData.invoiceFileImage!))
                    }
                  >
                    <Image
                      src={createBase64ImageUrl(requestData.invoiceFileImage!)}
                      alt='تصویر پیش فاکتور'
                      fill
                      className='object-cover rounded-md'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Details Card */}
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
              <div className='flex justify-between pt-2 border-t text-lg font-bold text-green-700'>
                <span>مبلغ قابل پرداخت:</span>
                <span>{formatAmount(requestData?.totalRefundAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checkbox + Rules + Buttons */}
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center mb-6 flex-wrap gap-2'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='terms-checkbox'
                  checked={isChecked}
                  disabled={isReadOnly}
                  onCheckedChange={checked => setIsChecked(checked === true)}
                />
                <label
                  htmlFor='terms-checkbox'
                  className='text-sm md:text-lg font-medium cursor-pointer'
                >
                  شرایط را مطالعه کرده‌ام و می‌پذیرم
                </label>
              </div>
              {ruleText && (
                <Button
                  type='button'
                  variant='link'
                  className='text-blue-600 hover:text-blue-800 underline text-sm font-medium'
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
                      <Loader2 className='w-4 h-4 ml-2 animate-spin' />
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
                      <Loader2 className='w-4 h-4 ml-2 animate-spin' />
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

      {/* Image Preview Dialog */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className='max-w-4xl max-h-screen p-2'>
          {selectedImage && (
            <div className='relative w-full h-[80vh]'>
              <Image src={selectedImage} alt='تصویر بزرگ شده' fill className='object-contain' />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rules Modal */}
      <Dialog open={isRulesModalOpen} onOpenChange={setIsRulesModalOpen}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-base font-bold'>قوانین و مقررات طرح</DialogTitle>
          </DialogHeader>
          <div className='text-sm whitespace-pre-wrap'>{ruleText}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
