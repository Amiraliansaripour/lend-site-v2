import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import OtpVerificationModal from "./OtpVerificationModal";
import UserInformation from "./UserInformation";
import Validation from "./Validation";
import toast from "react-hot-toast";

const ParentFlowManager = ({ userId, requestId }) => {
  const [currentStep, setCurrentStep] = useState("checking_otp_status");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [creditStatusData, setCreditStatusData] = useState(null);
  const [userInfoData, setUserInfoData] = useState(null);
  const token = localStorage.getItem("aToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const checkInitialOtpRequirement = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/UserFacility/Inquiry",
        {
          userId: userId,
          requestId: requestId,
        },
        {
          headers: {
            ...headers,
          },
        }
      );
      console.log("response.data.data", response.data.data);
      const requiresOtp = response?.data?.data?.otpStatus;
      console.log("fsdfsdfsdfdf", requiresOtp);
      if (requiresOtp === false) {
        setShowOtpModal(false);
      }
      if (requiresOtp === true) {
        setShowOtpModal(true);

        setCurrentStep("showing_otp_modal");
      } else if (requiresOtp === false) {
        setShowOtpModal(false);
        setCurrentStep("loading_data");
        fetchSubsequentData();
      } else {
        toast.error("پاسخ غیرمنتظره از سرور برای بررسی وضعیت کد تایید.");
        setCurrentStep("error");
      }
    } catch (error) {
      toast.error("خطا در بررسی وضعیت کد تایید اولیه.");
      setCurrentStep("error");
    }
  };

  const handleSendOtpApi = async (userId) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/UserFacility/Inquiry",
        { userId, otp: "" },
        {
          headers: {
            ...headers,
          },
        }
      );

      console.log("handle Send Otp response", response);
      return response?.data;
    } catch (error) {
      toast.error(error);
      throw error;
    }
  };

  const handleVerifyOtpApi = async (userId, otp) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/UserFacility/Inquiry",
        {
          isActive: true,
          userId: userId,
          otp: otp,
        },
        {
          headers: {
            ...headers,
          },
        }
      );

      const verificationSuccessful = response?.data?.data?.otpStatus === false;

      return {
        isSuccess: verificationSuccessful,
        message: verificationSuccessful
          ? "تایید موفقیت آمیز"
          : response?.data?.message || "کد وارد شده صحیح نیست.",
        responseData: response?.data?.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        message: error?.response?.data?.message || "خطا در بررسی کد تایید.",
      };
    }
  };

  const handleOtpVerifySuccess = (responseDataFromInquiry) => {
    console.log(
      "Parent: OTP Verified Successfully. Proceeding to load data..."
    );
    setShowOtpModal(false);

    if (responseDataFromInquiry?.creditStatusInfo) {
      setCreditStatusData(responseDataFromInquiry.creditStatusInfo);
    }
    if (responseDataFromInquiry?.userInfo) {
      setUserInfoData(responseDataFromInquiry.userInfo);
    }

    setCurrentStep("loading_data");

    fetchSubsequentData();
  };

  const fetchSubsequentData = async () => {
    setCurrentStep("loading_data");
    try {
      const userResponse = await axiosInstance.post(
        "/api/v1/User/Get",
        {
          userId: userId,
        },
        {
          headers: {
            ...headers,
          },
        }
      );
      setUserInfoData(userResponse?.data?.data);

      const creditResponse = await axiosInstance.post(
        "/api/v1/UserCreditStatus/CreditStatus",
        {
          isActive: true,
          userId: userId,
          requestId: requestId,
        },
        {
          headers: {
            ...headers,
          },
        }
      );
      setCreditStatusData(creditResponse?.data?.data);

      setCurrentStep("showing_forms");
    } catch (error) {
      toast.error("خطا در بارگذاری اطلاعات کاربر و اعتبار سنجی.");
      setUserInfoData(null);
      setCreditStatusData(null);
      setCurrentStep("error");
    }
  };

  useEffect(() => {
    if (userId && requestId) {
      checkInitialOtpRequirement();
    } else {
      console.warn(
        "Parent: userId or requestId is missing. Cannot start the flow."
      );

      setCurrentStep("error");
    }
  }, [userId, requestId]);

  if (currentStep === "checking_otp_status") {
    return (
      <div className="text-center p-4">در حال بررسی وضعیت کد تایید...</div>
    );
  }

  if (!showOtpModal && currentStep === "showing_otp_modal") {
    return (
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => {
          console.log("Parent: OTP Modal Closed by user");
          setShowOtpModal(false);

          setCurrentStep("error");
          toast.info("عملیات توسط کاربر لغو شد.");
        }}
        onVerifySuccess={handleOtpVerifySuccess}
        userId={userId}
        otpLength={5}
        sendOtpApi={handleSendOtpApi}
        verifyOtpApi={handleVerifyOtpApi}
        title="تایید شماره موبایل"
        descriptionText={`لطفا کد ${5} رقمی پیامک شده به شماره موبایل شما را وارد کنید.`}
      />
    );
  }

  if (currentStep === "loading_data") {
    return (
      <div className="text-center p-4">در حال بارگذاری اطلاعات شما...</div>
    );
  }

  if (currentStep === "showing_forms" && userInfoData && creditStatusData) {
    return (
      <>
        {/* نمایش کامپوننت اطلاعات کاربر */}
        <UserInformation
          user={userInfoData}
          onNext={(formData) => {
            console.log("UserInformation step done. Form Data:", formData);
            //setCurrentStep('showing_validation');
          }}
          onBack={() => {
            /* منطق بازگشت از UserInformation (مثلاً به صفحه قبل) */
          }}
        />

        {/* نمایش کامپوننت اعتبار سنجی */}
        <Validation
          user={userInfoData}
          requestId={requestId}
          creditStatusInitialData={creditStatusData}
          onNext={() => {
            /* منطق رفتن از Validation به مرحله نهایی */
          }}
          onBack={() => {
            /* منطق بازگشت از Validation (مثلاً به UserInformation یا قبل تر) */
          }}
        />
      </>
    );
  }

  if (currentStep === "error") {
    return (
      <div className="text-center p-4 text-red-500">
        خطا در اجرای فرایند. لطفا دوباره امتحان کنید.
      </div>
    );
  }

  return <div className="text-center p-4">در حال آماده‌سازی فرایند...</div>;
};

export default ParentFlowManager;
