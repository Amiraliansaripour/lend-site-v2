import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axiosInstance from '../../api/axiosInstance';
import OtpVerificationModal from '../../utils/OtpVerificationModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavigationButton from '../buttons/NavigationButton';
import toast from 'react-hot-toast';

const renderCard = (condition, trueText, falseText, title) => (
  <div
    className={`rounded-2xl font-bold p-3 border-2 ${condition ? 'border-green-600/50 bg-green-100/50' : 'border-red-600/50 bg-red-100/50'}`}
  >
    <div className='grid grid-cols-2 place-items-center h-10'>
      <h3 className='whitespace-nowrap'>{title} :</h3>
      <p className='text-center w-full'>{condition ? trueText : falseText}</p>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className='rounded-2xl font-bold p-3 border-2 border-gray-300/50 bg-gray-100/50 animate-pulse'>
    <div className='flex flex-col gap-2'>
      <p className='text-gray-500'>در حال بارگذاری ... </p>
      <div className='h-4 bg-gray-300 rounded w-full'></div>
    </div>
  </div>
);

const OTP_LENGTH = 5;

const FinotechValidation = ({ onNext, user, requestId, isEditMode }) => {
  const [requestData, setRequestData] = useState(null);
  const [isLoadingProcess, setIsLoadingProcess] = useState(true);
  const [otpRequired, setOtpRequired] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [facilityInquiryResponse, setFacilityInquiryResponse] = useState(null);
  const [hasCheckedOtpStatus, setHasCheckedOtpStatus] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const token = localStorage.getItem('aToken');
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );
  const getValidationData = useCallback(
    async userId => {
      setIsLoadingProcess(true);
      try {
        const response = await axiosInstance.post('/api/v1/UserCreditStatus/CreditStatus', {
          userId: user?.id,
          requestId: id,
        });
        const data = response?.data?.data;
        if (data) {
          setRequestData(data);
        } else {
          setRequestData({});
        }
      } catch (err) {
        setRequestData(null);
      } finally {
        setIsLoadingProcess(false);
      }
    },
    [id, user, headers],
  );
  const checkValidationData = () => {
    try {
      if (
        requestData?.lifeStatus === true &&
        requestData?.chequeColorStatus === 1 &&
        requestData?.isBlocked !== true &&
        requestData?.over18 &&
        requestData?.facilityDeferred === false &&
        requestData?.guarantyDeferred === false
      ) {
        console.log('here');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const checkInitialOtpStatus = useCallback(async () => {
    // Reset hasCheckedOtpStatus on each requestId change
    if (!requestId && !id) {
      return;
    }

    try {
      const response = await axiosInstance.post('/api/v1/UserFacility/Inquiry', {
        requestId: requestId || id,
        otp: '',
      });
      // Store the response for later use
      setFacilityInquiryResponse(response);
      const requiresOtp = response?.data?.data?.otpStatus;
      setOtpRequired(requiresOtp);
      setHasCheckedOtpStatus(true);

      if (!requiresOtp) {
        await getValidationData(user.id);
      } else {
        setShowOtpModal(true);
        setIsLoadingProcess(false);
      }
    } catch (error) {
      setHasCheckedOtpStatus(true);
      setOtpRequired(false);
      setIsLoadingProcess(false);
    }
  }, [requestId, id, user, headers, getValidationData]);

  const verifyOtpApi = useCallback(
    async otp => {
      // Prevent empty OTP submissions
      if (!otp || otp.trim() === '') {
        return {
          isSuccess: false,
          message: 'لطفا کد تایید را وارد کنید.',
        };
      }

      try {
        const response = await axiosInstance.post('/api/v1/UserFacility/Inquiry', {
          requestId: id,
          otp: otp,
        });

        const isVerificationSuccessful = !response?.data?.data?.otpStatus;
        if (!isVerificationSuccessful) {
          return {
            isSuccess: false,
            message: response?.data?.message || 'کد وارد شده صحیح نیست.',
          };
        }

        setShowOtpModal(false);
        setOtpRequired(false);
        await getValidationData(user.id);
        return {
          isSuccess: true,
        };
      } catch (error) {
        return {
          isSuccess: false,
          message: error?.response?.data?.message || 'خطا در بررسی کد تایید.',
        };
      }
    },
    [id, user, getValidationData, headers],
  );

  useEffect(() => {
    if (user?.id && (requestId || id)) {
      // Reset check status when component mounts or requestId changes
      setHasCheckedOtpStatus(false);
      setIsLoadingProcess(true);
      checkInitialOtpStatus();
    }
  }, [requestId, id, user?.id, checkInitialOtpStatus]);
  const onSubmit = async () => {
    if (isLoadingProcess || !requestData) {
      toast.error('پس از اعلام وضعیت اعتبارسنجی امکان رفتن به مرحله بعد وجود دارد.');
      return;
    }
    const isValid = checkValidationData();
    console.log('Dd', isValid);
    if (!isValid) {
      toast.error('برای ادامه اعتبارسنجی باید همه شرایط صحیح باشد.');
      return;
    }
    // منطق بررسی شرایط اعتبارسنجی
    axiosInstance.post(`/api/v1/Request/ChangeRequestState`, {
      id: requestId,
      requestState: 4,
    });

    if (isEditMode === true) {
      navigate('/dash');
    } else {
      onNext();
    }
  };
  const handleActualCancellation = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/Request/OptOut/${requestId || id}`);

      if (res.status === 200 || res?.data?.isSuccess) {
        toast.success('درخواست شما با موفقیت لغو شد');
        navigate('/dash');
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  if (isLoadingProcess && otpRequired === null) {
    return (
      <div className='fixed inset-0 flex flex-col items-center justify-center z-50 bg-white bg-opacity-80'>
        <p className='text-gray-700 text-lg'>در حال بررسی وضعیت اعتبارسنجی...</p>
      </div>
    );
  }

  return (
    <div className='relative main-validation-content'>
      {showOtpModal && (
        <OtpVerificationModal
          isOpen={showOtpModal}
          onClose={() => navigate('/dash')}
          onVerifySuccess={() => {
            setShowOtpModal(false);
            setOtpRequired(false);
          }}
          verifyOtpApi={verifyOtpApi}
          requestId={requestId}
          otpLength={OTP_LENGTH}
          title='کد دریافت اعتبار سنجی'
          descriptionText={`لطفا کد ${OTP_LENGTH} رقمی ارسال شده به شماره موبایل شما را وارد کنید.`}
        />
      )}

      {!showOtpModal && (
        <>
          <div className='w-full bg-white rounded-2xl gap-4 p-4'>
            <div className='mb-4'>
              <h2 className='font-bold text-xl'>اعتبار سنجی</h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-8'>
              {isLoadingProcess || !requestData ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  {renderCard(requestData?.lifeStatus, 'است', 'نیست', 'در قید حیات')}
                  {renderCard(
                    requestData?.chequeColorStatus === 1,
                    'فاقد چک برگشتی',
                    'دارای چک برگشتی',
                    'چک برگشتی',
                  )}
                  {renderCard(!requestData?.isBlocked, 'نیست', 'است', 'لیست سیاه بانکی')}
                  {renderCard(requestData?.over18, 'است', 'نیست', 'بالای 18 سال')}
                  {renderCard(
                    requestData?.facilityDeferred === false,
                    'ندارد',
                    'دارد',
                    'تسهیلات معوق',
                  )}
                  {renderCard(
                    requestData?.guarantyDeferred === false,
                    'ندارد',
                    'دارد',
                    'ضمانت های معوق',
                  )}
                </>
              )}
            </div>
          </div>

          {isEditMode ? (
            <div className='flex justify-center gap-6 mt-10 md:mt-12'>
              <button
                onClick={onSubmit}
                type='button'
                className='bg-gold-primary-900 hover:bg-gold-primary-800 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-primary-700 focus:ring-opacity-50'
              >
                ویرایش
              </button>
            </div>
          ) : (
            <NavigationButton
              onNext={onSubmit}
              onCancel={handleActualCancellation}
              isFirstStep={false}
              isNextDisabled={!checkValidationData()}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FinotechValidation;
