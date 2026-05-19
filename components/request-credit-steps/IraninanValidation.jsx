import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import OtpVerificationModal from "../../utils/OtpVerificationModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavigationButton from "../buttons/NavigationButton";
import toast from "react-hot-toast";
import OtpVerificationModal5Digit from "../../utils/OtpVerificationModal5Digit";

const renderCard = (condition, trueText, falseText, title) => (
  <div className={`rounded-2xl font-bold p-3 border-2 ${condition ? "border-green-600/50 bg-green-100/50" : "border-red-600/50 bg-red-100/50"}`}>
    <div className="grid grid-cols-2 place-items-center h-10">
      <h3 className="whitespace-nowrap">{title} :</h3>
      <p className="text-center w-full">{condition ? trueText : falseText}</p>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="rounded-2xl font-bold p-3 border-2 border-gray-300/50 bg-gray-100/50 animate-pulse">
    <div className="flex flex-col gap-2">
      <p className="text-gray-500">در حال بارگذاری ... </p>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
    </div>
  </div>
);

const IraninanValidation = ({ onNext, user, requestId, isEditMode, neededScore }) => {
  const [requestData, setRequestData] = useState(null);
  const [isLoadingProcess, setIsLoadingProcess] = useState(false);
  const [otpRequired, setOtpRequired] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInfo, setOtpInfo] = useState({ token: null, trackId: null });
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const checkValidationData = () => {
    try {
      if (requestData?.score) {
        let userScore = Number(requestData?.score);
        let requiredScore = Number(neededScore);
        if (userScore >= requiredScore) {
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const checkInitialOtpStatus = useCallback(async () => {
    if (!requestId && !id) {
      return;
    }
    try {
      const { data } = await axiosInstance.post("/api/v1/UserFacility/SendOtp", {
        requestId: requestId || id,
        otp: "",
      });
      if (!data?.data?.score) {
        setShowOtpModal(true);
        setOtpInfo({ token: data?.data?.token, trackId: data?.data?.trackId });
      } else {
        setRequestData(data?.data);
      }
    } catch (error) {
      setOtpRequired(false);
      setIsLoadingProcess(false);
    }
  }, [requestId, id, user]);
  const verifyOtpApi = async (otpCode) => {
    if (!requestId && !id) {
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const { data } = await axiosInstance.post("/api/v1/UserFacility/VerifyOtp", {
        trackId: otpInfo.trackId,
        token: otpInfo.token,
        otp: otpCode,
        requestId: requestId || id,
      });

      if (data.isSuccess) {
        toast.success(data.message || "کد با موفقیت تایید شد");
        setShowOtpModal(false);
        setOtpRequired(false);
        setRequestData(data?.data);
        setIsLoadingProcess(false);
      } else {
        toast.error(data.message || "خطا در تایید کد");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "خطایی رخ داد، لطفا مجدد تلاش کنید";
      toast.error(errorMessage);
      setOtpRequired(false);
      setIsLoadingProcess(false);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  useEffect(() => {
    if (user?.id && (requestId || id)) {
      setIsLoadingProcess(true);
      checkInitialOtpStatus();
    }
  }, [requestId, id, user?.id, checkInitialOtpStatus]);
  const onSubmit = async () => {
    if (isVerifyingOtp) {
      toast.error("پس از اعلام وضعیت اعتبارسنجی امکان رفتن به مرحله بعد وجود دارد.");
      return;
    }
    const isValid = checkValidationData();
    if (!isValid) {
      toast.error(`امتیاز مورد نیاز برای این طرح ${neededScore} است`);
      return;
    }
    axiosInstance.post(`/api/v1/Request/ChangeRequestState`, {
      id: requestId,
      requestState: 4,
    });

    if (isEditMode === true) {
      navigate("/dash");
    } else {
      onNext();
    }
  };
  const handleActualCancellation = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/Request/OptOut/${requestId || id}`);

      if (res.status === 200 || res?.data?.isSuccess) {
        toast.success("درخواست شما با موفقیت لغو شد");
        navigate("/dash");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="relative main-validation-content">
      {showOtpModal && <OtpVerificationModal5Digit isOpen={showOtpModal} onClose={() => setShowOtpModal(false)} onConfirm={verifyOtpApi} title="تایید کد پنج رقمی" isLoading={isVerifyingOtp} />}

      {!showOtpModal && (
        <>
          <div className="w-full bg-white rounded-2xl gap-4 p-4">
            <div className="mb-4">
              <h2 className="font-bold text-xl">اعتبار سنجی</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-8">
              {isVerifyingOtp ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <div className={`rounded-2xl font-bold p-3 border-2 ${requestData?.score >= neededScore ? "border-green-600/50 bg-green-100/50" : "border-red-600/50 bg-red-100/50"}`}>
                    <div className="grid grid-cols-2 place-items-center h-10">
                      <h3 className="whitespace-nowrap">امتیاز :</h3>
                      <p className="text-center w-full">{requestData?.score || 0}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl font-bold p-3 border-2 border-blue-600/50 bg-blue-100/50">
                    <div className="grid grid-cols-2 place-items-center h-10">
                      <h3 className="whitespace-nowrap">ریسک :</h3>
                      <p className="text-center w-full">{requestData?.risk || "-"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl font-bold p-3 border-2 border-purple-600/50 bg-purple-100/50">
                    <div className="grid grid-cols-2 place-items-center h-10">
                      <h3 className="whitespace-nowrap">امتیاز مورد نیاز :</h3>
                      <p className="text-center w-full">{neededScore || 0}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {isEditMode ? (
            <div className="flex justify-center gap-6 mt-10 md:mt-12">
              <button onClick={onSubmit} type="button" className="bg-gold-primary-900 hover:bg-gold-primary-800 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-primary-700 focus:ring-opacity-50">
                ویرایش
              </button>
            </div>
          ) : (
            <NavigationButton onNext={onSubmit} onCancel={handleActualCancellation} isFirstStep={false} isNextDisabled={!checkValidationData()} />
          )}
        </>
      )}
    </div>
  );
};

export default IraninanValidation;
