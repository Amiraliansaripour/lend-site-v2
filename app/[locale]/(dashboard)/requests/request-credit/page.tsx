'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { PageContent } from '@/components/page-content';
import { Breadcrumbs, PageContainer } from '@/components/page-container';
import {
  LoanCalc,
  UserInformation,
  PayValidation,
  Validation,
  IncomeInformation,
  ProformaInvoice,
  Collateral,
  AcceptByUser,
} from '@/components/page/request-credit';
import { RequestSummaryBar } from '@/components/page/request-credit/request-summary-bar';
import { getUserId } from '@/lib/auth/client/user-info';
import { ConfirmDialog } from '@/components/confirm-dialog';

import { useRequestWithPlanData, useRequestPreview, useUserRequests } from '@/queries/request';
import { usePlan } from '@/queries/plan';
import type { PlanDetail } from '@/api/plan';
import { useUserWithStore } from '@/queries/users';
import { useChangeRequestState } from '@/mutations/request';
import {
  canCancelRequest,
  canModifyRequestData,
  REQUEST_STATE_CANCELLED,
} from '@/utils/request-status';
import { toast } from 'sonner';

const breadcrumbs: Breadcrumbs = [{ label: 'درخواست اعتبار', href: '/requests/request-credit' }];

interface StepConfig {
  label: string;
  key: number;
}

export default function RequestCreditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = getUserId();

  const [currentStep, setCurrentStep] = useState(1);
  const [stepsToShow, setStepsToShow] = useState<StepConfig[]>([]);
  const [isStepsLoaded, setIsStepsLoaded] = useState(false);
  const [planData, setPlanData] = useState<PlanDetail | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [forCorrections] = useState<number[]>([]);
  const [correctionStepIndex, setCorrectionStepIndex] = useState(0);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isBackToPaymentDialogOpen, setIsBackToPaymentDialogOpen] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const activeStepRef = useRef<HTMLDivElement>(null);

  const { data: user } = useUserWithStore(userId || '');

  const id = searchParams.get('id') || createdRequestId;
  const editMode = searchParams.get('editMode') === 'true';

  const { data: requestData } = useRequestWithPlanData(id || '');
  const { data: previewData, refetch: refetchPreview } = useRequestPreview(id || '');
  const { data: plan } = usePlan(requestData?.planId || previewData?.planId || '');
  const { data: userRequests = [] } = useUserRequests(userId || '');
  const changeRequestStateMutation = useChangeRequestState();

  const requestState = requestData?.requestState ?? previewData?.requestState ?? 0;
  const isReadOnly = requestState > 0 && !canModifyRequestData(requestState);
  const showCancel = !!id && canCancelRequest(requestState);

  const planIsInvoiceRequired =
    requestData?.planIsInvoiceRequired ?? previewData?.planIsInvoiceRequired;
  const planIsGuaranteeRequired =
    requestData?.planIsGuaranteeRequired ?? previewData?.planIsGuaranteeRequired;
  const planIsIncomeRequired =
    requestData?.planIsIncomeRequired ?? previewData?.planIsIncomeRequired;
  const planIsValidateRequired =
    requestData?.planIsValidateRequired ?? previewData?.planIsValidateRequired;

  const refreshPreview = useCallback(async () => {
    if (!id) return;
    await refetchPreview();
  }, [id, refetchPreview]);

  const allSteps: StepConfig[] = [
    { label: 'انتخاب طرح', key: 1 },
    { label: 'اطلاعات هویتی', key: 2 },
    { label: 'پرداخت', key: 3 },
    { label: 'اعتبار سنجی', key: 4 },
    { label: 'اطلاعات درآمدی', key: 5 },
    { label: 'پیش فاکتور', key: 6 },
    { label: 'ضمانت', key: 7 },
    { label: 'تایید کلی اطلاعات', key: 8 },
  ];

  useEffect(() => {
    if (id) {
      setIsEditMode(editMode);
      setIsStepsLoaded(false);
    }
  }, [id, editMode]);

  useEffect(() => {
    if (plan) {
      setPlanData(plan);
    }
  }, [plan]);

  useEffect(() => {
    const stepSource = requestData ?? previewData;
    if (stepSource && !isStepsLoaded) {
      let normalizedStep: number;
      const state = stepSource.requestState;

      if (state >= 11 && state <= 18) {
        normalizedStep = state - 10 + (editMode ? 0 : 1);
      } else if (state >= 1 && state <= 8) {
        normalizedStep = state + (editMode ? 0 : 1);
      } else if (state >= 21 && state <= 28) {
        normalizedStep = state - 20 + (editMode ? 0 : 1);
      } else {
        normalizedStep = 1;
      }

      let filteredSteps = [...allSteps];

      if (!planIsInvoiceRequired) {
        filteredSteps = filteredSteps.filter(step => step.key !== 6);
      }
      if (!planIsGuaranteeRequired) {
        filteredSteps = filteredSteps.filter(step => step.key !== 7);
      }
      if (!planIsIncomeRequired) {
        filteredSteps = filteredSteps.filter(step => step.key !== 5);
      }
      if (!planIsValidateRequired) {
        filteredSteps = filteredSteps.filter(step => step.key !== 4);
        filteredSteps = filteredSteps.filter(step => step.key !== 3);
      }
      setStepsToShow(filteredSteps);
      setCurrentStep(prev => (prev > 1 ? Math.max(prev, normalizedStep) : normalizedStep));
      setIsStepsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requestData,
    previewData,
    editMode,
    planIsInvoiceRequired,
    planIsGuaranteeRequired,
    planIsIncomeRequired,
    planIsValidateRequired,
  ]);

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      });
    }
  }, [currentStep]);

  useEffect(() => {
    if (stepsToShow.length > 0 && isStepsLoaded) {
      const isStep = stepsToShow.find(i => i.key === currentStep);
      if (!isStep) {
        for (let index = 0; index < stepsToShow.length; index++) {
          const element = stepsToShow[index];
          if (element.key > currentStep) {
            setCurrentStep(element.key);
            return;
          }
        }
      }
    }
  }, [stepsToShow, currentStep, isStepsLoaded]);

  const handleNext = useCallback(async () => {
    await refreshPreview();

    if (isEditMode && forCorrections.length > 0) {
      if (correctionStepIndex < forCorrections.length - 1) {
        setCorrectionStepIndex(prev => prev + 1);
        setCurrentStep(forCorrections[correctionStepIndex + 1]);
      } else {
        router.push('/requests');
      }
      return;
    }

    const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
    if (currentIndex !== -1 && currentIndex < stepsToShow.length - 1) {
      setCurrentStep(stepsToShow[currentIndex + 1].key);
    } else if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/requests');
    }
  }, [
    refreshPreview,
    isEditMode,
    forCorrections,
    correctionStepIndex,
    stepsToShow,
    currentStep,
    router,
  ]);

  const hasValidationStep = Boolean(planIsValidateRequired);

  const handleBack = useCallback(async () => {
    if (isEditMode && forCorrections.length > 0) {
      if (correctionStepIndex > 0) {
        await refreshPreview();
        setCorrectionStepIndex(prev => prev - 1);
        setCurrentStep(forCorrections[correctionStepIndex - 1]);
      }
      return;
    }

    // From income (step 5), going back with validation required jumps to payment (step 3).
    if (currentStep === 5 && hasValidationStep) {
      setIsBackToPaymentDialogOpen(true);
      return;
    }

    const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      await refreshPreview();
      setCurrentStep(stepsToShow[currentIndex - 1].key);
    }
  }, [
    isEditMode,
    forCorrections,
    correctionStepIndex,
    stepsToShow,
    currentStep,
    hasValidationStep,
    refreshPreview,
  ]);

  const handleConfirmBackToPayment = useCallback(async () => {
    await refreshPreview();
    setCurrentStep(3);
  }, [refreshPreview]);

  const canGoBack =
    isEditMode && forCorrections.length > 0
      ? correctionStepIndex > 0
      : stepsToShow.findIndex(step => step.key === currentStep) > 0;

  const backHandler = canGoBack ? handleBack : undefined;

  const handleCancelRequest = useCallback(async () => {
    if (!id || !canCancelRequest(requestState)) {
      toast.error('امکان لغو این درخواست وجود ندارد');
      return;
    }

    try {
      await changeRequestStateMutation.mutateAsync({
        id,
        requestState: REQUEST_STATE_CANCELLED,
      });
      toast.success('درخواست شما با موفقیت لغو شد');
      setIsCancelDialogOpen(false);
      router.push('/requests');
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).response?.data?.message
          : undefined;
      toast.error(msg || 'خطا در لغو درخواست');
    }
  }, [id, requestState, changeRequestStateMutation, router]);

  const openCancelDialog = useCallback(() => {
    if (!showCancel) return;
    setIsCancelDialogOpen(true);
  }, [showCancel]);

  const cancelHandler = showCancel ? openCancelDialog : undefined;

  const renderProgressBar = () => (
    <div className='mb-8 overflow-x-auto'>
      <div className='flex items-center justify-between min-w-max px-4'>
        {stepsToShow.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted = stepsToShow.findIndex(s => s.key === currentStep) > index;
          const isCorrection = forCorrections.includes(step.key);

          return (
            <div key={step.key} className='flex items-center' ref={isActive ? activeStepRef : null}>
              <div className='flex flex-col items-center'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : isCorrection
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span
                  className={`mt-2 text-xs text-center whitespace-nowrap ${
                    isActive ? 'font-bold text-primary' : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < stepsToShow.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!user || !userId) {
    return (
      <PageContainer breadcrumbs={breadcrumbs}>
        <PageContent title='درخواست اعتبار'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <p>لطفا ابتدا وارد شوید</p>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='مراحل ثبت درخواست'>
        <div className='rounded-2xl bg-card p-6 shadow-lg'>
          {renderProgressBar()}

          {currentStep > 1 && (
            <RequestSummaryBar
              previewData={previewData}
              requestData={requestData}
              planData={planData}
            />
          )}

          {isReadOnly && (
            <div className='mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
              درخواست شما در حال بررسی است و امکان ویرایش اطلاعات وجود ندارد. در صورت نیاز می‌توانید
              درخواست را لغو کرده و درخواست جدیدی ثبت کنید.
            </div>
          )}

          <div className='transition-opacity duration-300'>
            {(!isStepsLoaded || stepsToShow.find(step => step.key === 1)) && currentStep === 1 && (
              <div key='step1'>
                <LoanCalc
                  onNext={data => {
                    if (data?.requestId) {
                      setCreatedRequestId(data.requestId);
                      router.replace(`/requests/request-credit?id=${data.requestId}`);
                    }
                    handleNext();
                  }}
                  isEditMode={isEditMode}
                  existingRequests={userRequests}
                  existingRequestId={id || undefined}
                  initialPlanId={previewData?.planId || requestData?.planId || undefined}
                  initialCreditAmount={
                    previewData?.creditAmount ?? requestData?.creditAmount ?? undefined
                  }
                />
              </div>
            )}

            {(!isStepsLoaded || stepsToShow.find(step => step.key === 2)) && currentStep === 2 && (
              <div key='step2'>
                <UserInformation
                  requestId={id || ''}
                  user={{
                    id: userId || '',
                    firstName: user?.firstName || previewData?.userFirstName || '',
                    lastName: user?.lastName || previewData?.userLastName || '',
                    nationalCode: user?.nationalCode || previewData?.userNationalCode || '',
                    personInfo: {
                      phoneNumber:
                        user?.phoneNumber ||
                        user?.personInfo?.phoneNumber ||
                        previewData?.userPhoneNumber ||
                        '',
                      birthDate: user?.personInfo?.birthDate || '',
                      cityProvinceName: user?.personInfo?.cityProvinceName || '',
                      cityName: user?.personInfo?.cityName || '',
                      address: user?.personInfo?.address || '',
                      postalCode: user?.personInfo?.postalCode || '',
                      telephone: user?.personInfo?.telephone || '',
                    },
                  }}
                  onNext={() => handleNext()}
                  onBack={backHandler}
                  onCancel={cancelHandler}
                  isEditMode={isEditMode}
                  isReadOnly={isReadOnly}
                />
              </div>
            )}

            {(!isStepsLoaded || stepsToShow.find(step => step.key === 3)) && currentStep === 3 && (
              <div key='step3'>
                <PayValidation
                  requestId={id || ''}
                  user={user}
                  validationPrice={planData?.documentAmount || 0}
                  onNext={() => handleNext()}
                  onBack={backHandler}
                  onCancel={cancelHandler}
                  isEditMode={isEditMode}
                  isReadOnly={isReadOnly}
                />
              </div>
            )}

            {isStepsLoaded && stepsToShow.find(step => step.key === 4) && currentStep === 4 && (
              <div key='step4'>
                <Validation
                  requestId={id || ''}
                  nationalCode={user?.nationalCode || previewData?.userNationalCode || ''}
                  mobileNumber={
                    user?.personInfo?.phoneNumber ||
                    user?.phoneNumber ||
                    previewData?.userPhoneNumber ||
                    ''
                  }
                  neededScore={planData?.score}
                  onNext={() => handleNext()}
                  onBack={backHandler}
                  onCancel={cancelHandler}
                  isEditMode={isEditMode}
                  isReadOnly={isReadOnly}
                />
              </div>
            )}

            {isStepsLoaded && stepsToShow.find(step => step.key === 5) && currentStep === 5 && (
              <div key='step5'>
                <IncomeInformation
                  requestId={id || ''}
                  onNext={() => handleNext()}
                  onBack={backHandler}
                  onCancel={cancelHandler}
                  isEditMode={isEditMode}
                  isReadOnly={isReadOnly}
                  previewData={previewData}
                />
              </div>
            )}

            {(!isStepsLoaded || stepsToShow.find(step => step.key === 6)) && currentStep === 6 && (
              <div key='step6'>
                <ProformaInvoice
                  requestId={id || ''}
                  onNext={() => handleNext()}
                  onBack={backHandler}
                  onCancel={cancelHandler}
                  isEditMode={isEditMode}
                  isReadOnly={isReadOnly}
                  previewData={previewData}
                />
              </div>
            )}

            {isStepsLoaded && stepsToShow.find(step => step.key === 7) && currentStep === 7 && (
              <div key='step7'>
                <Collateral
                  requestId={id || ''}
                  guarantees={
                    planData?.guarantees ||
                    previewData?.planGuarantees ||
                    requestData?.planGuarantees ||
                    []
                  }
                  guaranteedAmount={
                    previewData?.guaranteedAmount ??
                    requestData?.guaranteedAmount ??
                    planData?.documentAmount ??
                    0
                  }
                  onNext={() => handleNext()}
                  onBack={backHandler}
                  onCancel={cancelHandler}
                  isEditMode={isEditMode}
                  isReadOnly={isReadOnly}
                  previewData={previewData}
                />
              </div>
            )}

            {(!isStepsLoaded || stepsToShow.find(step => step.key === 8)) && currentStep === 8 && (
              <div key='step8'>
                <AcceptByUser
                  requestId={id || ''}
                  userId={userId || ''}
                  ruleText={planData?.ruleText}
                  onConfirm={() => handleNext()}
                  onBack={backHandler}
                  onCancel={cancelHandler}
                  isReadOnly={isReadOnly}
                />
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog
          open={isCancelDialogOpen}
          setOpen={setIsCancelDialogOpen}
          title='لغو درخواست'
          description='آیا از لغو این درخواست اطمینان دارید؟ پس از لغو می‌توانید درخواست جدیدی ثبت کنید.'
          confirmText='بله، لغو شود'
          cancelText='خیر'
          isPending={changeRequestStateMutation.isPending}
          onConfirm={handleCancelRequest}
        />

        <ConfirmDialog
          open={isBackToPaymentDialogOpen}
          setOpen={setIsBackToPaymentDialogOpen}
          title='بازگشت به مرحله پرداخت'
          description='در صورت بازگشت، به مرحله پرداخت (مرحله ۳) منتقل می‌شوید و باید دوباره از آن مرحله ادامه دهید. آیا مطمئن هستید؟'
          confirmText='بله، بازگشت'
          cancelText='انصراف'
          onConfirm={handleConfirmBackToPayment}
        />
      </PageContent>
    </PageContainer>
  );
}
