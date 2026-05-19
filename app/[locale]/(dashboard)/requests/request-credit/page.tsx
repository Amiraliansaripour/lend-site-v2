'use client';

import { useEffect, useState, useRef } from 'react';
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
import { getUserId } from '@/lib/auth/client/user-info';

import { useRequestWithPlanData } from '@/queries/request';
import { usePlan } from '@/queries/plan';
import type { PlanDetail } from '@/api/plan';
import { useUserWithStore } from '@/queries/users';

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

  const activeStepRef = useRef<HTMLDivElement>(null);

  const { data: user } = useUserWithStore(userId || '');

  const id = searchParams.get('id');
  const editMode = searchParams.get('editMode') === 'true';

  const { data: requestData } = useRequestWithPlanData(id || '');
  const { data: plan } = usePlan(requestData?.planId || '');

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
    console.log('🎯 ID changed:', id, 'editMode:', editMode);
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
    if (requestData && !isStepsLoaded) {
      let normalizedStep: number;
      const requestState = requestData.requestState;

      if (requestState >= 11 && requestState <= 18) {
        normalizedStep = requestState - 10 + (editMode ? 0 : 1);
      } else if (requestState >= 1 && requestState <= 8) {
        normalizedStep = requestState + (editMode ? 0 : 1);
      } else if (requestState >= 21 && requestState <= 28) {
        normalizedStep = requestState - 20 + (editMode ? 0 : 1);
      } else {
        normalizedStep = 1;
      }

      console.log('📍 Normalized step:', normalizedStep);

      let filteredSteps = [...allSteps];

      if (!requestData.planIsInvoiceRequired) {
        filteredSteps = filteredSteps.filter(step => step.key !== 6);
      }
      if (!requestData.planIsGuaranteeRequired) {
        filteredSteps = filteredSteps.filter(step => step.key !== 7);
      }
      if (!requestData.planIsIncomeRequired) {
        filteredSteps = filteredSteps.filter(step => step.key !== 5);
      }
      if (!requestData.planIsValidateRequired) {
        filteredSteps = filteredSteps.filter(step => step.key !== 4);
        filteredSteps = filteredSteps.filter(step => step.key !== 3);
      }
      console.log(filteredSteps);
      setStepsToShow(filteredSteps);
      setCurrentStep(normalizedStep);
      setIsStepsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestData, editMode]);

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

  const handleNext = () => {
    if (isEditMode && forCorrections.length > 0) {
      if (correctionStepIndex < forCorrections.length - 1) {
        setCorrectionStepIndex(prev => prev + 1);
        setCurrentStep(forCorrections[correctionStepIndex + 1]);
      } else {
        router.push('/requests');
      }
    } else {
      const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
      if (currentIndex !== -1 && currentIndex < stepsToShow.length - 1) {
        setCurrentStep(stepsToShow[currentIndex + 1].key);
      } else {
        router.push('/requests');
      }
    }
  };

  const handleCancel = () => {
    if (isEditMode && forCorrections.length > 0) {
      if (correctionStepIndex > 0) {
        setCorrectionStepIndex(prev => prev - 1);
        setCurrentStep(forCorrections[correctionStepIndex - 1]);
      }
    } else {
      const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
      if (currentIndex > 0) {
        setCurrentStep(stepsToShow[currentIndex - 1].key);
      }
    }
  };

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

          <div className='transition-opacity duration-300'>
            {(!isStepsLoaded || stepsToShow.find(step => step.key === 1)) && currentStep === 1 && (
              <div key='step1'>
                <LoanCalc onNext={() => handleNext()} isEditMode={isEditMode} />
              </div>
            )}

            {(!isStepsLoaded || stepsToShow.find(step => step.key === 2)) && currentStep === 2 && (
              <div key='step2'>
                <UserInformation
                  requestId={id || ''}
                  user={{
                    id: userId || '',
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    nationalCode: user?.nationalCode || '',
                    personInfo: {
                      phoneNumber: user?.phoneNumber || '',
                      birthDate: user?.personInfo?.birthDate || '',
                      cityProvinceName: user?.personInfo?.cityProvinceName || '',
                      cityName: user?.personInfo?.cityName || '',
                      address: user?.personInfo?.address || '',
                      postalCode: user?.personInfo?.postalCode || '',
                      telephone: user?.personInfo?.telephone || '',
                    },
                  }}
                  onNext={() => handleNext()}
                  onCancel={handleCancel}
                  isEditMode={isEditMode}
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
                  onCancel={handleCancel}
                  isEditMode={isEditMode}
                />
              </div>
            )}

            {isStepsLoaded && stepsToShow.find(step => step.key === 4) && currentStep === 4 && (
              <div key='step4'>
                <Validation
                  requestId={id || ''}
                  userId={userId || ''}
                  neededScore={planData?.score}
                  validateType={planData?.validateType ?? requestData?.validateType ?? null}
                  onNext={() => handleNext()}
                  onCancel={handleCancel}
                  isEditMode={isEditMode}
                />
              </div>
            )}

            {isStepsLoaded && stepsToShow.find(step => step.key === 5) && currentStep === 5 && (
              <div key='step5'>
                <IncomeInformation
                  requestId={id || ''}
                  onNext={() => handleNext()}
                  onCancel={handleCancel}
                  isEditMode={isEditMode}
                />
              </div>
            )}

            {(!isStepsLoaded || stepsToShow.find(step => step.key === 6)) && currentStep === 6 && (
              <div key='step6'>
                <ProformaInvoice
                  requestId={id || ''}
                  onNext={() => handleNext()}
                  onCancel={handleCancel}
                  isEditMode={isEditMode}
                />
              </div>
            )}

            {isStepsLoaded && stepsToShow.find(step => step.key === 7) && currentStep === 7 && (
              <div key='step7'>
                <Collateral
                  requestId={id || ''}
                  guarantees={planData?.guarantees || []}
                  guaranteedAmount={requestData?.guaranteedAmount ?? planData?.documentAmount ?? 0}
                  onNext={() => handleNext()}
                  onCancel={handleCancel}
                  isEditMode={isEditMode}
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
                  onCancel={handleCancel}
                />
              </div>
            )}
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
